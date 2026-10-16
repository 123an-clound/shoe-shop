import { execFile } from 'node:child_process';

const quote = value => '"' + value.replaceAll('"', '""') + '"';
const literal = value => "'" + value.replaceAll("'", "''") + "'";
const qualified = (schema, name) => quote(schema) + '.' + quote(name);
export function query(config, sql) {
  return new Promise((resolve, reject) => {
    execFile(config.cliBinary, ['db', 'query', '--linked', '--project-ref', config.projectRef, '--output', 'json', sql],
      { cwd: config.projectDir, windowsHide: true, maxBuffer: 128 * 1024 * 1024, timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          let code = 'BACKUP_QUERY_FAILED';
          try { const payload = JSON.parse(stdout); const type = payload.error?.code; if (typeof type === 'string' && /^[A-Za-z0-9_]{1,80}$/.test(type)) code = type.toUpperCase().slice(0,32); } catch { /* Never expose raw SQL output. */ }
          if (/access token not provided|not logged in|login.*required/i.test(stderr)) code = 'BACKUP_CLI_AUTH_MISSING';
          if (/not.*recognized|spawn.*ENOENT/i.test(stderr)) code = 'BACKUP_CLI_TOOL_MISSING';
          return reject(Object.assign(new Error('Backup database query failed'), { code }));
        }
        try { const parsed = JSON.parse(stdout); const rows = Array.isArray(parsed) ? parsed : parsed.rows; if (!Array.isArray(rows)) throw 0; resolve(rows); }
        catch { reject(new Error('Backup database response invalid')); }
      });
  });
}

export const metadataSql = `select jsonb_build_object(
 'tables',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname,'rls',c.relrowsecurity,'forceRls',c.relforcerowsecurity,
   'columns',(select jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notNull',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'identity',a.attidentity,'generated',a.attgenerated) order by a.attnum) from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped),
   'constraints',(select coalesce(jsonb_agg(jsonb_build_object('name',x.conname,'type',x.contype,'definition',pg_get_constraintdef(x.oid),'refSchema',rn.nspname,'refTable',rc.relname,'columns',(select jsonb_agg(a.attname order by k.ord) from unnest(x.conkey) with ordinality k(num,ord) join pg_attribute a on a.attrelid=c.oid and a.attnum=k.num))), '[]'::jsonb) from pg_constraint x left join pg_class rc on rc.oid=x.confrelid left join pg_namespace rn on rn.oid=rc.relnamespace where x.conrelid=c.oid),
   'indexes',(select coalesce(jsonb_agg(pg_get_indexdef(i.indexrelid)),'[]'::jsonb) from pg_index i where i.indrelid=c.oid and not exists(select 1 from pg_constraint x where x.conindid=i.indexrelid)),
   'triggers',(select coalesce(jsonb_agg(pg_get_triggerdef(t.oid)),'[]'::jsonb) from pg_trigger t where t.tgrelid=c.oid and not t.tgisinternal)) order by n.nspname,c.relname)
   from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind='r' and n.nspname in ('public','private') and c.relname like 'veloce_%'),
 'functions',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),'definition',pg_get_functiondef(p.oid),'grants',(select jsonb_agg(jsonb_build_object('role',coalesce(r.rolname,'PUBLIC'),'privilege',a.privilege_type)) from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a left join pg_roles r on r.oid=a.grantee))) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.proname like 'veloce_%' and p.prokind='f'),
 'policies',(select coalesce(jsonb_agg(to_jsonb(p)),'[]'::jsonb) from pg_policies p where (p.schemaname in ('public','private') and p.tablename like 'veloce_%') or (p.schemaname='storage' and p.policyname like 'veloce_%')),
 'grants',(select coalesce(jsonb_agg(to_jsonb(g)),'[]'::jsonb) from information_schema.role_table_grants g where g.table_schema in ('public','private') and g.table_name like 'veloce_%'),
 'sequences',(select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relname like 'veloce_%' and c.relkind='S'),
 'columnGrants',(select coalesce(jsonb_agg(to_jsonb(g)),'[]'::jsonb) from information_schema.column_privileges g where g.table_schema in ('public','private') and g.table_name like 'veloce_%' and g.grantee not in ('postgres','service_role','supabase_admin')),
 'authEnums',(select coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'name',t.typname,'values',(select jsonb_agg(e.enumlabel order by e.enumsortorder) from pg_enum e where e.enumtypid=t.oid))),'[]'::jsonb) from pg_type t join pg_namespace n on n.oid=t.typnamespace where t.typtype='e' and n.nspname='auth')
) as metadata`;

export async function snapshot(config) {
  const metadata = (await query(config, metadataSql))[0].metadata;
  if (metadata.sequences !== 0 || !metadata.tables?.length) throw new Error('Unsupported database shape');
  for (const table of metadata.tables) {
    if (!['public', 'private'].includes(table.schema) || !/^veloce_[a-z0-9_]+$/.test(table.name)) throw new Error('Backup table scope invalid');
    if (table.columns.some(c => c.identity || c.generated)) throw new Error('Generated/identity column requires backup support');
  }
  const tables = metadata.tables.map(table => {
    // Live session/counter state is deliberately not revived on restoration.
    const ephemeral = table.schema === 'private' && ['veloce_session_activity', 'veloce_request_limits', 'veloce_form_rate_limits'].includes(table.name);
    return `jsonb_build_object('schema',${literal(table.schema)},'name',${literal(table.name)},'ephemeral',${ephemeral},'rowsJson',${ephemeral ? "'[]'" : `(select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)::text from ${qualified(table.schema, table.name)} t)`})`;
  });
  const refs = metadata.tables.flatMap(t => t.constraints.filter(c => c.type === 'f' && c.refSchema === 'auth' && c.refTable === 'users')
    .map(c => { if (c.columns.length !== 1) throw new Error('Composite auth reference unsupported'); return `select ${quote(c.columns[0])} as id from ${qualified(t.schema, t.name)} where ${quote(c.columns[0])} is not null`; }));
  if (!refs.length) throw new Error('Auth references missing');
  const ids = refs.join(' union ');
  const authTables = ['users', 'identities', 'mfa_factors'];
  const auth = authTables.map(name => `jsonb_build_object('schema','auth','name',${literal(name)},'rowsJson',(select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb)::text from auth.${quote(name)} t where ${name === 'users' ? 'id' : 'user_id'} in (${ids})),
    'columns',(select jsonb_agg(jsonb_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),'notNull',false,'default',case when a.attgenerated<>'' then pg_get_expr(d.adbin,d.adrelid) else null end,'identity',a.attidentity,'generated',a.attgenerated) order by a.attnum) from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid='auth.${name}'::regclass and a.attnum>0 and not a.attisdropped))`);
  const data = (await query(config, `select jsonb_build_object('takenAt',clock_timestamp(),'tables',jsonb_build_array(${tables.join(',')}),'auth',jsonb_build_array(${auth.join(',')}),
    'buckets',(select jsonb_agg(to_jsonb(b)) from storage.buckets b where b.id in ('veloce','veloce-uploads')),
    'objects',(select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'bucket',o.bucket_id,'name',o.name,'updatedAt',o.updated_at,'metadata',o.metadata) order by o.name),'[]'::jsonb) from storage.objects o where o.bucket_id='veloce')) as snapshot`))[0].snapshot;
  return { format: 1, projectRef: config.projectRef, metadata, ...data };
}

function createTable(table) {
  const columns = table.columns.map(c => `${quote(c.name)} ${c.type}${c.generated ? ' GENERATED ALWAYS AS (' + c.default + ') STORED' : c.default ? ' DEFAULT ' + c.default : ''}${c.notNull ? ' NOT NULL' : ''}`);
  return `CREATE TABLE ${qualified(table.schema, table.name)} (${columns.join(',')});`;
}

export async function restoreInMemory(snapshot, PGlite) {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema private; create schema storage;
      create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
      create function auth.jwt() returns jsonb language sql as $$select coalesce(nullif(current_setting('test.jwt',true),''),'{}')::jsonb$$;
      create table auth.sessions(id uuid primary key,user_id uuid,created_at timestamptz,updated_at timestamptz,not_after timestamptz);
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key,bucket_id text,name text,owner uuid,owner_id text,metadata jsonb);
      create function storage.foldername(name text) returns text[] language sql immutable as $$select string_to_array(name,'/')$$;
      set check_function_bodies=false;`);
    for (const type of snapshot.metadata.authEnums) await db.exec(`CREATE TYPE ${qualified(type.schema, type.name)} AS ENUM (${type.values.map(literal).join(',')});`);
    for (const table of snapshot.auth) {
      await db.exec(createTable(table));
      if (['users', 'identities', 'mfa_factors'].includes(table.name)) await db.exec(`alter table ${qualified('auth', table.name)} add primary key(id);`);
    }
    for (const table of snapshot.metadata.tables) await db.exec(createTable(table));
    // Apply keys/checks before data, FKs after all rows, triggers only after import.
    for (const table of snapshot.metadata.tables) for (const c of table.constraints.filter(c => c.type !== 'f')) {
      await db.exec(`ALTER TABLE ${qualified(table.schema, table.name)} ADD CONSTRAINT ${quote(c.name)} ${c.definition};`);
    }
    const counts = {};
    for (const table of [...snapshot.auth, ...snapshot.tables]) {
      const name = qualified(table.schema, table.name);
      const definition = [...snapshot.metadata.tables, ...snapshot.auth].find(t => t.schema === table.schema && t.name === table.name);
      const columns = definition.columns.filter(c => !c.generated).map(c => quote(c.name)).join(',');
      await db.query(`insert into ${name} (${columns}) select ${columns} from jsonb_populate_recordset(null::${name},$1::jsonb)`, [table.rowsJson]);
      const result = await db.query(`select count(*)::int as count,coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb)=(select coalesce(jsonb_agg(to_jsonb(e) order by to_jsonb(e)::text),'[]'::jsonb) from jsonb_populate_recordset(null::${name},$1::jsonb) e) as matches from ${name} t`, [table.rowsJson]);
      if (!result.rows[0].matches) {
        const differences = await db.query(`with a as (select to_jsonb(t) as v,row_number() over(order by to_jsonb(t)::text) as ord from ${name} t), e as (select to_jsonb(t) as v,row_number() over(order by to_jsonb(t)::text) as ord from jsonb_populate_recordset(null::${name},$1::jsonb) t) select distinct k from a join e using(ord),lateral jsonb_object_keys(e.v) k where a.v->k is distinct from e.v->k`, [table.rowsJson]);
        throw Object.assign(new Error('Restored rows differ'), { backupTable: table.schema + '.' + table.name, backupColumns: differences.rows.map(r => r.k) });
      }
      counts[table.schema + '.' + table.name] = result.rows[0].count;
    }
    for (const fn of snapshot.metadata.functions) {
      if (!['public', 'private'].includes(fn.schema) || !/^veloce_[a-z0-9_]+$/.test(fn.name)) throw new Error('Function scope invalid');
      await db.exec(fn.definition);
      const sig = `${qualified(fn.schema, fn.name)}(${fn.args})`;
      await db.exec(`REVOKE ALL ON FUNCTION ${sig} FROM PUBLIC,anon,authenticated,service_role;`);
      for (const grant of fn.grants ?? []) await db.exec(`GRANT ${grant.privilege} ON FUNCTION ${sig} TO ${grant.role === 'PUBLIC' ? 'PUBLIC' : quote(grant.role)};`);
    }
    for (const table of snapshot.metadata.tables) {
      const name = qualified(table.schema, table.name);
      for (const c of table.constraints.filter(c => c.type === 'f')) await db.exec(`ALTER TABLE ${name} ADD CONSTRAINT ${quote(c.name)} ${c.definition};`);
      for (const index of table.indexes) await db.exec(index);
      for (const trigger of table.triggers) await db.exec(trigger);
      if (table.rls) await db.exec(`ALTER TABLE ${name} ENABLE ROW LEVEL SECURITY;`);
      if (table.forceRls) await db.exec(`ALTER TABLE ${name} FORCE ROW LEVEL SECURITY;`);
    }
    for (const grant of snapshot.metadata.grants) {
      if (['postgres', 'supabase_admin'].includes(grant.grantee)) continue;
      await db.exec(`GRANT ${grant.privilege_type} ON ${qualified(grant.table_schema, grant.table_name)} TO ${grant.grantee === 'PUBLIC' ? 'PUBLIC' : quote(grant.grantee)};`);
    }
    for (const grant of snapshot.metadata.columnGrants) await db.exec(`GRANT ${grant.privilege_type} (${quote(grant.column_name)}) ON ${qualified(grant.table_schema, grant.table_name)} TO ${grant.grantee === 'PUBLIC' ? 'PUBLIC' : quote(grant.grantee)};`);
    for (const policy of snapshot.metadata.policies) {
      const roles = policy.roles.map(r => r === 'public' ? 'PUBLIC' : quote(r)).join(',');
      await db.exec(`CREATE POLICY ${quote(policy.policyname)} ON ${qualified(policy.schemaname, policy.tablename)} AS ${policy.permissive} FOR ${policy.cmd} TO ${roles}${policy.qual ? ' USING (' + policy.qual + ')' : ''}${policy.with_check ? ' WITH CHECK (' + policy.with_check + ')' : ''};`);
    }
    await db.exec('grant usage on schema public,private,auth to anon,authenticated; set role anon;');
    const protectedRows = await db.query('select count(*)::int as count from public.veloce_orders').catch(error => {
      if (error.code === '42501') return { rows: [{ count: 0 }] };
      throw error;
    });
    if (protectedRows.rows[0].count !== 0) throw new Error('Restored anonymous order isolation failed');
    await db.exec('reset role');
    const valid = await db.query('select bool_and(relrowsecurity) as ok from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind=\'r\' and n.nspname in (\'public\',\'private\') and c.relname like \'veloce_%\'');
    if (!valid.rows[0].ok) throw new Error('Restored RLS missing');
    return { counts, functions: snapshot.metadata.functions.length, policies: snapshot.metadata.policies.length, constraintsValidated: true, anonymousOrdersHidden: true };
  } finally { await db.close(); }
}
