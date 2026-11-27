-- Reviewed answers and the expert queue (docs/REVIEWED_ANSWERS.md).
-- ANDA answers questions only from answers a person wrote and a second person approved.
-- A question the library doesn't cover goes to an expert, who replies to the person.

create table if not exists public.reviewed_answers (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 5 and 300),
  -- Other ways people ask the same thing, one per line. They are searched too.
  other_phrasings text not null default '' check (char_length(other_phrasings) <= 2000),
  answer text not null check (char_length(answer) between 20 and 4000),
  -- Where the answer comes from (guidelines, papers, the reviewer's role), shown with it.
  sources text not null default '' check (char_length(sources) <= 1000),
  lang text not null default 'en' check (lang in ('en', 'fr', 'pt')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  written_by text not null,
  approved_by text,
  approved_at timestamptz,
  -- How it was checked: 'evidence' = checked by ANDA against named guidelines and research;
  -- 'clinical' = also confirmed by a clinician (staff role clinical_reviewer). Shown with the answer.
  review_level text not null default 'evidence' check (review_level in ('evidence', 'clinical')),
  clinical_reviewer text,
  clinical_reviewed_at timestamptz,
  review_due date, -- approved answers are re-checked by this date
  helpful integer not null default 0,
  not_helpful integer not null default 0,
  search tsvector generated always as (
    setweight(to_tsvector('english', question || ' ' || other_phrasings), 'A') || setweight(to_tsvector('english', answer), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Two people: whoever approves an answer did not write it.
  constraint reviewed_answers_two_person check (
    status <> 'approved' or (approved_by is not null and approved_at is not null and lower(approved_by) <> lower(written_by))
  ),
  constraint reviewed_answers_clinical check (
    review_level <> 'clinical' or (clinical_reviewer is not null and clinical_reviewed_at is not null)
  )
);
create index if not exists reviewed_answers_search_idx on public.reviewed_answers using gin (search);
alter table public.reviewed_answers enable row level security;
revoke all on public.reviewed_answers from anon, authenticated;
grant select (id, question, answer, sources, lang, status, approved_at, review_level) on public.reviewed_answers to anon, authenticated;
drop policy if exists reviewed_answers_public_read on public.reviewed_answers;
create policy reviewed_answers_public_read on public.reviewed_answers
  for select to anon, authenticated
  using (status = 'approved');

-- Approved answers that cover a question. An answer counts only when it contains at least
-- half of the question's words (after dropping common words and stemming), so a question
-- the library doesn't cover returns nothing and goes to an expert instead of a near miss.
-- ponytail: word matching only; add embeddings (pgvector + Workers AI) if real questions miss.
create or replace function public.search_reviewed_answers(q text, max_results integer default 3)
returns table (id uuid, question text, answer text, sources text, lang text, review_level text, coverage real)
language sql
stable
security definer
set search_path = public
as $$
  with words as (
    select array(select distinct w from unnest(tsvector_to_array(to_tsvector('english', left(coalesce(q, ''), 500)))) w) as lex
  ),
  any_word as (
    select lex, case when cardinality(lex) = 0 then null
      else array_to_string(array(select quote_literal(w) from unnest(lex) w), ' | ')::tsquery end as tsq
    from words
  )
  select a.id, a.question, a.answer, a.sources, a.lang, a.review_level,
    (select count(*) from unnest(aw.lex) w where a.search @@ quote_literal(w)::tsquery)::real / cardinality(aw.lex) as coverage
  from public.reviewed_answers a, any_word aw
  where aw.tsq is not null
    and a.status = 'approved'
    and a.search @@ aw.tsq
    and (select count(*) from unnest(aw.lex) w where a.search @@ quote_literal(w)::tsquery)::real / cardinality(aw.lex) >= 0.5
  order by coverage desc, ts_rank_cd(a.search, aw.tsq) desc
  limit least(greatest(coalesce(max_results, 3), 1), 5)
$$;
revoke all on function public.search_reviewed_answers(text, integer) from public;
grant execute on function public.search_reviewed_answers(text, integer) to anon, authenticated, service_role;

-- "Did this help?" Counts only: nothing about who pressed it is kept.
-- ponytail: anyone can press it repeatedly; add a per-browser limit if the counts get gamed.
create or replace function public.rate_reviewed_answer(answer_id uuid, was_helpful boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.reviewed_answers
  set helpful = helpful + case when was_helpful then 1 else 0 end,
      not_helpful = not_helpful + case when was_helpful then 0 else 1 end
  where id = answer_id and status = 'approved'
$$;
revoke all on function public.rate_reviewed_answer(uuid, boolean) from public;
grant execute on function public.rate_reviewed_answer(uuid, boolean) to anon, authenticated, service_role;

-- Questions for an expert. The person sees their own; staff work through them in /admin/questions.
create table if not exists public.expert_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null check (char_length(question) between 5 and 1000),
  channel text not null default 'web' check (channel in ('web', 'telegram')),
  crisis boolean not null default false, -- the safety screen matched; shown first to staff
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  answer text check (char_length(answer) <= 4000),
  answered_by text,
  answered_at timestamptz,
  reviewed_answer_id uuid references public.reviewed_answers (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists expert_questions_open_idx on public.expert_questions (crisis desc, created_at) where status = 'open';
create index if not exists expert_questions_user_idx on public.expert_questions (user_id, created_at desc);
alter table public.expert_questions enable row level security;
revoke all on public.expert_questions from anon, authenticated;
grant select on public.expert_questions to authenticated;
drop policy if exists expert_questions_own_read on public.expert_questions;
create policy expert_questions_own_read on public.expert_questions
  for select to authenticated
  using (user_id = auth.uid());

-- A staff role for the clinician who approves answers (lib/admin/permissions.ts): no access to users or payments.
alter table public.staff_members drop constraint if exists staff_members_role_check;
alter table public.staff_members add constraint staff_members_role_check
  check (role in ('super_admin', 'support', 'finance', 'engineering', 'clinical_reviewer', 'read_only'));
