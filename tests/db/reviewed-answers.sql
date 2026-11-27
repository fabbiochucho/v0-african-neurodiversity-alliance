-- Level 1 retrieval checks for scripts/061 (docs/REVIEWED_ANSWERS.md), run in CI against the
-- local Supabase. Fixture answers only exist in this test database.
\set ON_ERROR_STOP on
-- Runs in a transaction that is rolled back; the real library (scripts/063) is set aside so only fixtures count.
begin;
update public.reviewed_answers set status = 'retired' where written_by = 'claude-ai-draft';

insert into public.reviewed_answers (question, other_phrasings, answer, status, written_by, approved_by, approved_at) values
  ('How can we make bedtime calmer?', 'My child won''t sleep at night', 'CI fixture: keep the same short routine every night, dim the lights and avoid screens in the last hour.', 'approved', 'a@example.invalid', 'b@example.invalid', now()),
  ('How do I ask a school for classroom adjustments?', 'Talking to teachers about support at school', 'CI fixture: ask for a meeting, bring notes on what helps at home and agree one or two changes to try first.', 'approved', 'a@example.invalid', 'b@example.invalid', now()),
  ('What helps with meltdowns in public?', '', 'CI fixture: this one is still a draft and must never be returned.', 'draft', 'a@example.invalid', null, null),
  ('How do we prepare for a dentist visit?', '', 'CI fixture: this one was retired and must never be returned.', 'retired', 'a@example.invalid', null, null);

do $$
declare
  cases text[][] := array[
    -- question as a parent might type it, the reviewed question it must find ('' = nothing)
    array['my son cannot sleep at night', 'How can we make bedtime calmer?'],
    array['bedtime routine', 'How can we make bedtime calmer?'],
    array['how to talk to his teachers about support', 'How do I ask a school for classroom adjustments?'],
    array['classroom adjustments', 'How do I ask a school for classroom adjustments?'],
    array['meltdowns in public', ''],
    array['dentist visit', ''],
    array['what is the capital of Kenya', ''],
    array['', '']
  ];
  got text;
begin
  for i in 1 .. array_length(cases, 1) loop
    select question into got from public.search_reviewed_answers(cases[i][1], 1);
    if coalesce(got, '') <> cases[i][2] then
      raise exception 'FAIL retrieval: "%" returned "%", expected "%"', cases[i][1], coalesce(got, ''), cases[i][2];
    end if;
  end loop;
end;
$$;

-- An answer can't be approved by the person who wrote it.
do $$
begin
  begin
    insert into public.reviewed_answers (question, answer, status, written_by, approved_by, approved_at)
    values ('Self approval check', 'CI fixture: should be refused by the two person rule.', 'approved', 'a@example.invalid', 'A@example.invalid', now());
    raise exception 'FAIL: the writer approved their own answer';
  exception when check_violation then null;
  end;
end;
$$;

-- Visitors see approved answers only, and nothing of the expert queue or who wrote what.
set role anon;
do $$
begin
  if (select count(*) from public.reviewed_answers) <> 2 then raise exception 'FAIL: anon should see only the 2 approved answers'; end if;
  begin
    perform written_by from public.reviewed_answers limit 1;
    raise exception 'FAIL: anon can read written_by';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.expert_questions limit 1;
    raise exception 'FAIL: anon can read expert_questions';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

rollback;
