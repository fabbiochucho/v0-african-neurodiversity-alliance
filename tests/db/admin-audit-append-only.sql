-- Integration check for scripts/059, run in CI against the local Supabase (as service_role,
-- the role the app writes with). Fails the job if the audit log can be changed or deleted.
\set ON_ERROR_STOP on
set role service_role;

insert into public.admin_audit_log (actor_email, action, target_type, target_id, after)
values ('ci@example.invalid', 'ci.check', 'test', '1', '{"ok": true}');

do $$
begin
  begin
    update public.admin_audit_log set action = 'ci.tampered' where action = 'ci.check';
    raise exception 'FAIL: update was allowed';
  exception when insufficient_privilege or raise_exception then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  begin
    delete from public.admin_audit_log where action = 'ci.check';
    raise exception 'FAIL: delete was allowed';
  exception when insufficient_privilege or raise_exception then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
  if (select count(*) from public.admin_audit_log where action = 'ci.check') <> 1 then
    raise exception 'FAIL: audit row missing';
  end if;
end;
$$;

reset role;
-- Signed-in users and visitors can't read staff or audit data.
set role authenticated;
do $$
begin
  perform 1 from public.admin_audit_log limit 1;
  raise exception 'FAIL: authenticated can read the audit log';
exception when insufficient_privilege then null;
end;
$$;
do $$
begin
  perform 1 from public.staff_members limit 1;
  raise exception 'FAIL: authenticated can read staff_members';
exception when insufficient_privilege then null;
end;
$$;
reset role;
select 'admin audit log is append-only' as result;
