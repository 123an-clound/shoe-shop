import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Targeted detector, not a substitute for a managed secret scanner. Values are
// never included in output, including when an operational error occurs.
try {
  const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']});
  const patterns=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['supabase-secret',/sb_secret_[A-Za-z0-9_-]{20,}/],['aws-access',/AKIA[0-9A-Z]{16}/],['github-token',/gh[pousr]_[A-Za-z0-9]{30,}/],['database-credential',/postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/]];
  const needles=existsSync('.env.local')?readFileSync('.env.local','utf8').split(/\r?\n/).map(line=>line.match(/^([A-Z][A-Z0-9_]*(?:PASSWORD|SECRET|SECURITY_KEY))=(.*)$/)).filter(Boolean).map(m=>({name:m[1],value:m[2].trim().replace(/^['"]|['"]$/g,'')})).filter(m=>m.value.length>=8):[];
  const findings=[];
  const inspect=(buffer,location)=>{
    if(buffer.includes(0))return;
    const text=buffer.toString('utf8');
    const kinds=patterns.filter(([,pattern])=>pattern.test(text)).map(([name])=>name);
    for(const token of text.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)){
      try{if(JSON.parse(Buffer.from(token[0].split('.')[1],'base64url')).role==='service_role')kinds.push('service-role-jwt');}catch{/* Ignore strings that are not JWTs. */}
    }
    for(const secret of needles)if(text.includes(secret.value))kinds.push('exact-local-secret:'+secret.name);
    if(kinds.length)findings.push({location,kinds:[...new Set(kinds)]});
  };
  const files=git('ls-files','--cached','--others','--exclude-standard').trim().split('\n').filter(Boolean);
  for(const file of files)if(existsSync(file)&&statSync(file).isFile())inspect(readFileSync(file),'working-tree:'+file);
  const objects=git('rev-list','--objects','--all').trim().split('\n').filter(Boolean);
  const paths=new Map(objects.map(line=>{const i=line.indexOf(' ');return[i<0?line:line.slice(0,i),i<0?'':line.slice(i+1)];}));
  const checked=execFileSync('git',['cat-file','--batch-check=%(objecttype) %(objectname) %(objectsize)'],{input:[...paths.keys()].join('\n')+'\n',encoding:'utf8',maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']});
  let blobs=0;
  for(const line of checked.trim().split('\n')){
    const [type,id,size]=line.split(' ');if(type!=='blob')continue;blobs++;
    inspect(execFileSync('git',['cat-file','blob',id],{maxBuffer:Math.max(Number(size)+1024,1024*1024),stdio:['pipe','pipe','pipe']}),'history:'+id.slice(0,12)+':'+paths.get(id));
  }
  let bundles=0;
  const walk=dir=>{for(const name of readdirSync(dir)){const path=join(dir,name);if(statSync(path).isDirectory())walk(path);else if(/\.(js|map)$/.test(path)){bundles++;inspect(readFileSync(path),'browser:'+path);}}};
  if(existsSync('.next/static'))walk('.next/static');
  console.log(JSON.stringify({workingTreeFiles:files.length,historyCommits:Number(git('rev-list','--count','--all').trim()),historyBlobs:blobs,browserFiles:bundles,findings},null,2));
  if(findings.length)process.exitCode=1;
}catch{
  console.error('Security scan failed; diagnostic content suppressed to protect secrets.');process.exitCode=1;
}
