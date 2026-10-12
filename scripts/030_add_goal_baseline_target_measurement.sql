-- IEP wizard (audit item F.7): every goal gets the
-- baseline -> target -> measurement shape, so progress can be judged
-- against where the person started. Purely additive; existing goals keep
-- nulls and render as before.
alter table public.iep_goals
  add column if not exists baseline text,
  add column if not exists target text,
  add column if not exists measurement text;
