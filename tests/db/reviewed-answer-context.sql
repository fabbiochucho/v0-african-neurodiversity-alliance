-- Checks for scripts/064 (local context notes), run in CI against the local Supabase.
\set ON_ERROR_STOP on
begin;
do $$
begin
  if (select count(*) from public.reviewed_answer_context where written_by = 'claude-ai-draft') < 25 then
    raise exception 'FAIL: expected the 25 drafted context notes';
  end if;
  begin
    insert into public.reviewed_answer_context (answer_id, scope, kind, note, written_by, status, approved_by, approved_at)
    select id, 'TZ', 'local', 'CI fixture: self-approved note must be refused.', 'a@example.invalid', 'approved', 'A@example.invalid', now()
    from public.reviewed_answers limit 1;
    raise exception 'FAIL: a writer approved their own context note';
  exception when check_violation then null;
  end;
  begin
    insert into public.reviewed_answer_context (answer_id, scope, kind, note, written_by)
    select id, 'Nigeria', 'local', 'CI fixture: a scope must be africa or a 2-letter code.', 'a@example.invalid' from public.reviewed_answers limit 1;
    raise exception 'FAIL: a bad scope was accepted';
  exception when check_violation then null;
  end;
end;
$$;
-- Approve one note and check visitors see only approved notes, and not who wrote them.
update public.reviewed_answer_context set status = 'approved', approved_by = 'ci-approver', approved_at = now()
where id = (select id from public.reviewed_answer_context where scope = 'NG' and kind = 'local' limit 1);
set role anon;
do $$
begin
  if (select count(*) from public.reviewed_answer_context) <> 1 then raise exception 'FAIL: anon should see only the 1 approved note'; end if;
  begin
    perform written_by from public.reviewed_answer_context limit 1;
    raise exception 'FAIL: anon can read written_by';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
rollback;
