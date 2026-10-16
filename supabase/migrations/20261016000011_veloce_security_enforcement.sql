-- Apply after the new app has VELOCE_SECURITY_KEY and trusted-source rate limiting.
revoke all on function public.veloce_check_auth_rate(text,text) from public, anon, authenticated;
drop policy if exists veloce_storage_write on storage.objects;
drop policy if exists veloce_storage_update on storage.objects;
create policy veloce_storage_write on storage.objects for insert to authenticated
with check (bucket_id='veloce' and private.veloce_is_admin() and private.veloce_trusted_request());
create policy veloce_storage_update on storage.objects for update to authenticated
using (bucket_id='veloce' and private.veloce_is_admin() and private.veloce_trusted_request())
with check (bucket_id='veloce' and private.veloce_is_admin() and private.veloce_trusted_request());
