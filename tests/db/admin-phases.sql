-- Integration checks for scripts/060, run in CI against the local Supabase.
\set ON_ERROR_STOP on

-- Published content is public; drafts and future posts are not.
insert into public.content_items (kind, slug, title, body, status, published_at, author_email, updated_by) values
  ('blog', 'ci-published', 'Published', 'x', 'published', now() - interval '1 hour', 'ci@example.invalid', 'ci'),
  ('blog', 'ci-draft', 'Draft', 'x', 'draft', null, 'ci@example.invalid', 'ci'),
  ('blog', 'ci-future', 'Future', 'x', 'published', now() + interval '1 day', 'ci@example.invalid', 'ci');
set role anon;
do $$
begin
  if (select count(*) from public.content_items where slug like 'ci-%') <> 1 then
    raise exception 'FAIL: anon should see exactly the one published post';
  end if;
end;
$$;
reset role;

-- Staff-only tables and functions are closed to signed-in users and visitors.
set role authenticated;
do $$
declare t text;
begin
  foreach t in array array['account_admin_status', 'account_notes', 'account_tags', 'feature_controls', 'feature_targets', 'abuse_flags'] loop
    begin
      execute format('select 1 from public.%I limit 1', t);
      raise exception 'FAIL: authenticated can read %', t;
    exception when insufficient_privilege then null;
    end;
  end loop;
  begin
    perform public.admin_user_search();
    raise exception 'FAIL: authenticated can run admin_user_search';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_revoke_sessions(gen_random_uuid());
    raise exception 'FAIL: authenticated can run admin_revoke_sessions';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

-- The service role can search.
set role service_role;
select count(*) >= 0 as search_ok from public.admin_user_search(p_q => 'nobody@example.invalid');
reset role;

delete from public.content_items where slug like 'ci-%';
select 'admin phases checks passed' as result;
