-- Local context for reviewed answers (docs/REVIEWED_ANSWERS.md, "Local context").
-- A note sits under an answer, either for everyone in Africa ('africa') or for one country (ISO code, e.g. 'NG').
--   kind 'myth'  = something people commonly hear, and what the evidence says instead
--   kind 'local' = laws, services and next steps where the person is
-- The country comes from the visitor's request (Vercel's country header) or their own choice; ANDA never stores it.
-- Same rule as answers: someone other than the writer approves a note before anyone sees it.

create table if not exists public.reviewed_answer_context (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.reviewed_answers (id) on delete cascade,
  scope text not null check (scope = 'africa' or scope ~ '^[A-Z]{2}$'),
  kind text not null check (kind in ('myth', 'local')),
  note text not null check (char_length(note) between 20 and 1500),
  sources text not null default '' check (char_length(sources) <= 1000),
  status text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  written_by text not null,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviewed_answer_context_two_person check (
    status <> 'approved' or (approved_by is not null and approved_at is not null and lower(approved_by) <> lower(written_by))
  ),
  unique (answer_id, scope, kind)
);
create index if not exists reviewed_answer_context_lookup_idx on public.reviewed_answer_context (answer_id, scope) where status = 'approved';
alter table public.reviewed_answer_context enable row level security;
revoke all on public.reviewed_answer_context from anon, authenticated;
grant select (id, answer_id, scope, kind, note, sources, status) on public.reviewed_answer_context to anon, authenticated;
drop policy if exists reviewed_answer_context_public_read on public.reviewed_answer_context;
create policy reviewed_answer_context_public_read on public.reviewed_answer_context
  for select to anon, authenticated
  using (status = 'approved');


-- Draft context notes, written by Claude (an AI) on 2026-11-27 from the sources named with each. DRAFTS: nobody sees
-- them until a person at ANDA checks each against its sources and approves it (/admin/answers or the review doc).
-- Idempotent; a note whose answer is missing is skipped.

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$"He's a boy, he'll talk late" or "she'll grow out of it." Some children do catch up, but waiting can lose valuable time for support. If you see the signs above, ask for a check now. If it turns out to be nothing, you've lost nothing.$t$, $t$WHO, Autism fact sheet (2023); NICE guideline CG128$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$What are the early signs of autism in young children?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Many families go first to a prayer house, a traditional healer or a medicine seller, often because a clinic is far away or costly. Faith and tradition can be a real comfort, and you don't have to give them up. But only a health professional can assess a child's development, so please see one as well, as early as you can. Across Africa, many children are only diagnosed years after their families first noticed something, which means support starts later.$t$, $t$Franz et al., Autism spectrum disorder in sub-Saharan Africa: a comprehensive scoping review, Autism Research (2017); Gona et al., Parents' and professionals' perceptions on causes and treatment options for autism spectrum disorders in a multicultural context on the Kenyan coast, PLoS One (2015)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I get my child assessed or diagnosed?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Rumours that vaccines cause autism, infertility or other harm have spread in several African countries. In 2003 and 2004, a boycott of polio vaccination in parts of northern Nigeria, driven by such rumours, was followed by a polio outbreak that spread to other countries. Vaccines used in national programmes are tested and monitored for safety, and serious side effects are rare.$t$, $t$Jegede, What led to the Nigerian boycott of the polio vaccination campaign?, PLoS Medicine (2007); WHO, Autism fact sheet (2023)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$Do vaccines cause autism?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$In many communities, autism and other developmental differences are explained as a curse, witchcraft, a punishment, an ancestral spirit, or a child who is "not fully of this world" (for example ogbanje beliefs in parts of Nigeria). Mothers are often blamed. Studies in Nigeria and Kenya have found these explanations among families and even some health workers. They are not supported by evidence, and no one is to blame.$t$, $t$Bakare et al., Etiological explanation, treatability and preventability of childhood autism: a survey of Nigerian healthcare workers' opinion, Annals of General Psychiatry (2009); Gona et al., PLoS One (2015)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$Is autism caused by bad parenting, a curse or witchcraft?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Families are sometimes told a child will be healed by deliverance, fasting, herbal mixtures, special water, or a stay at a prayer camp. Some of these places chain, beat or starve children and adults; human rights groups have documented this in many African countries. No ritual or remedy cures autism. If a place restrains, beats, starves or isolates someone, it is abuse: take them out and report it.$t$, $t$Human Rights Watch, Living in Chains: Shackling of People with Psychosocial Disabilities Worldwide (2020); Human Rights Watch, Like a Death Sentence: Abuses against Persons with Mental Disabilities in Ghana (2012)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$Can autism be cured? Which treatments should we avoid?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Meltdowns are often seen as a "spoilt" child or poor discipline, and parents may be pressured to beat the child. Beating doesn't stop meltdowns, can make them happen more often, and harms children. Calm, safety and preventing overload work better.$t$, $t$WHO, Corporal punishment and health, fact sheet (2021); NICE guideline CG170$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$What should I do during a meltdown?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Two beliefs come up often. "Speaking two or more languages at home causes the delay": it doesn't. Children can learn several languages, so keep using your home language. "Clipping the tongue (tongue-tie) will make the child talk": tongue-tie can affect feeding in babies, but it is rarely why a child isn't talking. Get a hearing check and a developmental assessment first.$t$, $t$Hambly et al., The influence of bilingualism on speech production: a systematic review, International Journal of Language and Communication Disorders (2013); Walsh and Tunkel, Diagnosis and treatment of ankyloglossia in newborns and infants: a review, JAMA Otolaryngology-Head and Neck Surgery (2017)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$My child isn't talking yet. How can I help with communication?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Some schools refuse autistic or disabled children, or say they can only go to a "special school". Most children can learn in an ordinary school with the right adjustments, and refusing them can break disability and education laws in many countries. A special school or unit can be right for some children, but it should be a choice made around the child's needs, not a way of excluding them.$t$, $t$UN Convention on the Rights of Persons with Disabilities, Article 24; UNESCO, A guide for ensuring inclusion and equity in education (2017)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I ask my child's school for support?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Children who struggle to read are often called lazy, dull or stubborn, and punished. Dyslexia has nothing to do with effort or intelligence. Punishment makes children avoid reading; the right teaching helps.$t$, $t$International Dyslexia Association, definition of dyslexia (2002); Rose (2009)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$What are the signs of dyslexia or a learning difficulty?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Parents, especially mothers, are often blamed for a child's condition, and some are left alone by partners or relatives. Your child's needs are not your fault, and asking for help is not weakness. Other parents across Africa have formed support groups because they have been through the same.$t$, $t$Lancet Commission on autism (2021); Franz et al., Autism Research (2017)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$I'm exhausted as a caregiver. Where can I get support?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Some families avoid any medicine for fear it will "turn the child into a zombie" or make them dependent; others buy sedatives or ADHD medicines without a prescription. When a doctor prescribes medicine for ADHD, sleep or epilepsy, it is checked and adjusted to limit side effects. Medicines bought without a prescription may be fake, the wrong strength, or dangerous.$t$, $t$NICE guideline NG87; WHO, 1 in 10 medical products in developing countries is substandard or falsified (2017)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$Should my child take medicine for ADHD or autism?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Common beliefs: epilepsy is caused by spirits or witchcraft; it can be caught from saliva or from touching someone during a seizure; a spoon or fingers in the mouth stops tongue-biting; burning or holding the person near fire helps. None of these is true. Epilepsy is a brain condition, it isn't contagious, and nothing should go in the mouth. WHO says up to 70% of people with epilepsy could live seizure-free with proper diagnosis and treatment.$t$, $t$WHO, Epilepsy fact sheet; Baskind and Birbeck, Epilepsy-associated stigma in sub-Saharan Africa: the social landscape of a disease, Epilepsy and Behavior (2005)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$What should I do if my child has a seizure?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'africa', 'myth', $t$Adults are sometimes told "you're too old for that", "everyone is a bit like that", or that a diagnosis is only for children. Autism and ADHD are lifelong, and an adult assessment is real and useful. Many adults first recognise themselves when a child or relative is diagnosed.$t$, $t$NICE guideline CG142; Lancet Commission on autism (2021)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$Can adults be diagnosed with autism or ADHD?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'NG', 'local', $t$In Nigeria, ask your nearest primary health centre or general hospital for a referral to a paediatrician, or to the child and adolescent mental health service at a federal teaching hospital or a Federal Neuro-Psychiatric Hospital (for example Yaba, Lagos). ANDA's Find Support directory lists verified services in Nigeria.$t$, $t$ANDA Find Support directory$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I get my child assessed or diagnosed?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'NG', 'local', $t$In Nigeria, the Discrimination Against Persons with Disabilities (Prohibition) Act 2018 gives persons with disabilities a right to education without discrimination, and the National Commission for Persons with Disabilities handles complaints. The Compulsory, Free Universal Basic Education Act 2004 provides free basic education for every child.$t$, $t$Discrimination Against Persons with Disabilities (Prohibition) Act 2018; Compulsory, Free Universal Basic Education Act 2004$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I ask my child's school for support?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'NG', 'local', $t$In Nigeria, call 112 for emergency help, or go straight to the nearest hospital emergency department.$t$, $t$Nigerian Communications Commission, 112 emergency number$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$What should I do if my child has a seizure?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'KE', 'local', $t$In Kenya, ask your local health centre for a referral to a paediatrician, a county referral hospital, Kenyatta National Hospital or Moi Teaching and Referral Hospital. For school support, the Educational Assessment and Resource Centre (EARC) in your area assesses children's learning needs.$t$, $t$Ministry of Education Kenya, Sector Policy for Learners and Trainees with Disabilities (2018); ANDA Find Support directory$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I get my child assessed or diagnosed?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'KE', 'local', $t$In Kenya, the Constitution (Article 54) protects the right of persons with disabilities to education, and the Ministry of Education's Sector Policy for Learners and Trainees with Disabilities (2018) sets out inclusive education. The National Council for Persons with Disabilities can advise you and register your child.$t$, $t$Constitution of Kenya (2010), Article 54; Ministry of Education Kenya, Sector Policy for Learners and Trainees with Disabilities (2018)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I ask my child's school for support?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'KE', 'local', $t$In Kenya, call 999 or 112 for emergency help.$t$, $t$Kenya emergency numbers 999 and 112$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$What should I do if my child has a seizure?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'GH', 'local', $t$In Ghana, ask your local clinic or district hospital for a referral to the child health department of a teaching hospital, such as Korle Bu Teaching Hospital in Accra or Komfo Anokye Teaching Hospital in Kumasi.$t$, $t$ANDA Find Support directory$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I get my child assessed or diagnosed?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'GH', 'local', $t$In Ghana, the Persons with Disability Act, 2006 (Act 715) and the Inclusive Education Policy (2015) support children with disabilities to learn in mainstream schools. The Special Education Division of the Ghana Education Service can help when a school refuses a child.$t$, $t$Persons with Disability Act, 2006 (Act 715); Ministry of Education Ghana, Inclusive Education Policy (2015)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I ask my child's school for support?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'GH', 'local', $t$In Ghana, call 112 for emergency help, or 193 for the National Ambulance Service.$t$, $t$Ghana emergency numbers 112 and 193$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$What should I do if my child has a seizure?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'ZA', 'local', $t$In South Africa, start at your local clinic and ask for a referral to a paediatrician or to the developmental assessment service at a regional or academic hospital, such as Red Cross War Memorial Children's Hospital in Cape Town. Autism South Africa can advise on services in your province.$t$, $t$Autism South Africa; ANDA Find Support directory$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I get my child assessed or diagnosed?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'ZA', 'local', $t$In South Africa, the Constitution protects the right to a basic education (section 29) and to equality (section 9). Education White Paper 6 (2001) and the SIAS policy (2014) set out how schools must identify and support learners who need extra help: ask the school's School-Based Support Team and, if needed, the District-Based Support Team.$t$, $t$Constitution of the Republic of South Africa, sections 9 and 29; Department of Education, Education White Paper 6 (2001); Department of Basic Education, Policy on Screening, Identification, Assessment and Support (2014)$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$How do I ask my child's school for support?$t$
on conflict (answer_id, scope, kind) do nothing;

insert into public.reviewed_answer_context (answer_id, scope, kind, note, sources, written_by)
select a.id, 'ZA', 'local', $t$In South Africa, call 10177 for an ambulance, or 112 from a mobile phone.$t$, $t$South African emergency numbers 10177 and 112$t$, 'claude-ai-draft' from public.reviewed_answers a where a.question = $t$What should I do if my child has a seizure?$t$
on conflict (answer_id, scope, kind) do nothing;
