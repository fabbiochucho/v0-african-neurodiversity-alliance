-- Draft reviewed answers (docs/REVIEWED_ANSWERS.md). Drafted by Claude (an AI) on 2026-11-27 from WHO guidance,
-- national guidelines (NICE, AAP), peer-reviewed research and US CDC text, written in ANDA's own words except where
-- CDC public-domain text is quoted and marked. The owner reviewed all 22 against their sources and approved each
-- "as is" in the review doc on 2026-11-27 (https://claude.ai/artifact/LhXmdnwG7HEEpdH4LNR3Nd), so they go in as
-- approved, credited to that review. They show as "not yet reviewed by a clinician" until a Clinical reviewer
-- confirms them. Idempotent: an answer whose question already exists is skipped.

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$What are the early signs of autism in young children?$t$, $t$signs of autism in toddlers
how do I know if my child is autistic
my child does not respond to their name
my baby avoids eye contact
is my child autistic$t$, $t$Autism shows up differently in every child. Signs families often notice in the first two to three years include:
- not responding to their name by about 9 to 12 months
- few gestures (waving, pointing to show you something) by 12 to 18 months
- little eye contact or shared smiles, or not bringing things to show you
- speech that comes late, or words and skills that were there and then are lost
- repeating movements such as hand-flapping, rocking or spinning, or lining up objects and getting upset when the order changes
- strong distress at small changes in routine
- unusual reactions to sounds, smells, tastes, textures or light.

One sign on its own doesn't mean autism, and many autistic children don't show all of them. If you notice several, or if your child loses speech or social skills they had, don't wait: ask a health worker for a developmental check. Early support helps, whatever the outcome.$t$, $t$WHO, Autism fact sheet (2023); US CDC, Signs and Symptoms of Autism Spectrum Disorder (2024); NICE guideline CG128, Autism spectrum disorder in under 19s: recognition, referral and diagnosis; Hyman et al., AAP clinical report, Pediatrics (2020)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$What are the early signs of autism in young children?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$How do I get my child assessed or diagnosed?$t$, $t$where can I get an autism diagnosis
who diagnoses autism or ADHD
how to get an assessment for my child
testing for autism
doctor for developmental delay$t$, $t$Start with whoever you can reach: a doctor, nurse or community health worker at your clinic, or a paediatrician. Describe what you've noticed with examples and when it started; a short phone video of the behaviour can help. Ask for a developmental assessment and, if needed, a referral to a specialist: a developmental or general paediatrician, a child psychologist, a child and adolescent psychiatrist, or a neurodevelopmental clinic (often at a teaching hospital).

A diagnosis is made by a qualified professional who observes and talks with the child and gathers history from family and school. There is no blood test or brain scan that diagnoses autism or ADHD, so be careful of anyone offering one.

Waiting lists can be long: ask to be put on one early, and start practical support at home in the meantime. ANDA's Find Support directory lists services by country. Online questionnaires, including ANDA's self-test, can help you prepare for an appointment but can't diagnose.$t$, $t$WHO, Autism fact sheet (2023); WHO, mhGAP Intervention Guide version 2.0 (child and adolescent mental and behavioural disorders); NICE guideline CG128$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$How do I get my child assessed or diagnosed?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$What are the signs of ADHD?$t$, $t$symptoms of ADHD in children
my child cannot sit still or concentrate
hyperactive child
attention problems at school
does my child have ADHD$t$, $t$ADHD (attention deficit hyperactivity disorder) means patterns of inattention, hyperactivity and impulsivity that are stronger than expected for a child's age, show up in more than one place (for example at home and at school), have lasted at least six months, and get in the way of daily life.
- Inattention can look like daydreaming, losing or forgetting things, careless mistakes, not finishing tasks, or seeming not to listen.
- Hyperactivity and impulsivity can look like fidgeting, constant running or climbing, talking a lot, interrupting, trouble waiting a turn, or acting without thinking about danger.

All young children are active and distracted at times; what matters is how strong and lasting it is and how much it affects life. Girls more often have the quieter, inattentive type and are easily missed. Poor sleep, hearing or eyesight problems, hunger, stress at home and learning difficulties can look like ADHD, which is one reason a professional assessment matters.$t$, $t$WHO, ICD-11 6A05 Attention deficit hyperactivity disorder; US CDC, Symptoms of ADHD (reviewed 2026); NICE guideline NG87, ADHD: diagnosis and management; Wolraich et al., AAP clinical practice guideline, Pediatrics (2019)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$What are the signs of ADHD?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$Do vaccines cause autism?$t$, $t$MMR vaccine and autism
can injections cause autism
my child became autistic after vaccination
should I vaccinate my autistic child$t$, $t$WHO's position is that the available evidence shows childhood vaccines, including the measles, mumps and rubella (MMR) vaccine, do not increase the risk of autism. Large studies of over a million children in several countries have found no link. The 1998 paper that started the worry was found to be dishonest and was withdrawn by the journal in 2010.

Signs of autism often become noticeable around the age when children have their vaccines, which is understandably why some families connect the two. The causes of autism are still being studied; research points mainly to genes and to how the brain develops before birth.

Not vaccinating leaves your child, and children around them, at risk of measles and other serious diseases. Please keep your child's vaccinations up to date, and talk to a health worker about any worries.

Note: in 2026 the US CDC changed the wording of its own page on this topic. ANDA follows WHO and the published studies listed below.$t$, $t$WHO, Autism fact sheet (2023); WHO Global Advisory Committee on Vaccine Safety, statements on MMR and autism; Taylor, Swerdfeger and Eslick, Vaccines are not associated with autism: an evidence-based meta-analysis, Vaccine (2014); Hviid et al., Measles, mumps, rubella vaccination and autism: a nationwide cohort study, Annals of Internal Medicine (2019); The Lancet, retraction of Wakefield et al. (2010)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$Do vaccines cause autism?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$Is autism caused by bad parenting, a curse or witchcraft?$t$, $t$is autism a spiritual attack
is autism a punishment from God
family says my child is cursed
did I cause my child's autism
what causes autism$t$, $t$No. Autism is a difference in how the brain develops. Research shows genes play a large part, along with factors before birth. It is not caused by anything a parent did, by a curse, by witchcraft, by sin, or by a child being spoilt.

These beliefs are common and can lead families to feel shame, hide a child, or try harmful "treatments". Autistic children have the same right to love, education, health care and respect as any child.

If people in your family or community say this, it can help to share trusted information (like this answer), to bring a relative to a health appointment, and to connect with other parents through a support group in ANDA's directory or community.$t$, $t$WHO, Autism fact sheet (2023); Lord et al., The Lancet Commission on the future of care and clinical research in autism, The Lancet (2021); UN Convention on the Rights of Persons with Disabilities$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$Is autism caused by bad parenting, a curse or witchcraft?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$Can autism be cured? Which treatments should we avoid?$t$, $t$cure for autism
autism treatment
is there medicine for autism
MMS chlorine dioxide autism
chelation autism
deliverance for autistic child$t$, $t$Autism is a lifelong difference, not an illness, so there is no cure, and anyone selling one is not telling the truth. What helps is support: help with communication, learning and daily living skills, and adapting the home and school.

Some products and practices are dangerous and should never be used, including:
- "MMS" or chlorine dioxide, which is a bleach
- chelation to "remove metals"
- beating, chaining, starving, or "deliverance" rituals.

Be cautious with expensive special diets, supplements or therapies that promise fast results; ask a doctor first. Medicines don't treat autism itself, but a doctor may prescribe them for problems that can come with it, such as sleep problems, epilepsy or ADHD.$t$, $t$WHO, Autism fact sheet (2023); NICE guideline CG170, Autism spectrum disorder in under 19s: support and management (interventions not to use); US FDA warning on chlorine dioxide products (2019); Lancet Commission on autism (2021)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$Can autism be cured? Which treatments should we avoid?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$How can we make bedtime and sleep easier?$t$, $t$my child won't sleep at night
child wakes up at night
bedtime routine for autistic child
sleep problems ADHD
child cannot fall asleep$t$, $t$Sleep problems are very common in autistic children and children with ADHD. Things that often help:
- the same short routine every night, in the same order (wash, toilet, nightclothes, a story, lights off); pictures of each step can help
- a regular bedtime and wake-up time, also at weekends
- no screens for about an hour before bed
- a dark, quiet, comfortable room, adjusted for sensory needs (steady background noise such as a fan, soft bedding, no scratchy labels)
- active play and daylight during the day
- no tea, coffee, cola or energy drinks in the afternoon and evening
- calm, brief returns to bed if the child gets up.

Keep a sleep diary for two weeks to spot patterns. If sleep stays very poor, or your child snores loudly, stops breathing in sleep or seems to be in pain, see a doctor. Don't give sleep medicine or supplements without a doctor's advice.$t$, $t$Williams Buckley et al., Practice guideline: treatment for insomnia and disrupted sleep behavior in children and adolescents with autism spectrum disorder, Neurology (2020); NICE guideline CG170; Hyman et al., AAP clinical report, Pediatrics (2020)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$How can we make bedtime and sleep easier?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$What should I do during a meltdown?$t$, $t$my child screams and hits when upset
tantrums in public
how to calm my autistic child
child loses control
meltdown vs tantrum$t$, $t$A meltdown is a reaction to being overwhelmed (by noise, crowds, change, tiredness, pain or too many demands). It is not deliberate bad behaviour, and the child usually can't stop it by choice.

During it:
- keep them and others safe
- move to somewhere quieter, or move other people away
- say little, calmly and simply
- reduce noise, light and touch (some children want firm pressure, others no touch at all)
- don't punish, shout or argue; give time.

Afterwards, offer water, rest and comfort, not a lecture. Over time, look for patterns: what happened just before? Hunger, a change of plan or a noisy place are common triggers. Preparing in advance (warning about changes, a picture schedule, a quiet space, ear defenders) can prevent many meltdowns. If meltdowns are frequent, involve self-injury, or seem linked to pain or illness, talk to a professional.$t$, $t$NICE guideline CG170 (behaviour that challenges); WHO, Caregiver Skills Training programme for families of children with developmental delays or disabilities; Lancet Commission on autism (2021)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$What should I do during a meltdown?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$My child isn't talking yet. How can I help with communication?$t$, $t$speech delay
child not talking at 2 years
late talker
how to help my child speak
non-verbal child
picture cards communication$t$, $t$Ways to help at home:
- talk about what your child is doing in short, simple words ("Ball. Big ball.") and pause to give them time to respond
- follow their interests and join their play
- use gestures, pictures or objects alongside words
- welcome any way they communicate: pointing, sounds, pulling your hand, pictures
- sing, read and name things through the day, and turn off background TV.

Using pictures, signs or a communication app does not stop a child learning to talk; research suggests it can support speech.

Get a hearing check, because hearing problems delay speech. Ask for an assessment, and a speech and language therapist if one is available, if your child is not babbling or using gestures by 12 months, has no single words by 16 months, no two-word phrases by 24 months, or loses words or skills at any age.$t$, $t$Filipek et al., Practice parameter: screening and diagnosis of autism, Neurology (2000); Millar, Light and Schlosser, The impact of augmentative and alternative communication intervention on the speech production of individuals with developmental disabilities, JSLHR (2006); WHO, Caregiver Skills Training programme$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$My child isn't talking yet. How can I help with communication?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$My child will only eat a few foods. What can I do?$t$, $t$picky eater
fussy eating autism
child refuses new foods
my child only eats rice
feeding problems$t$, $t$Very selective eating is common in autistic children, often because of a food's texture, smell, colour or look, not stubbornness.
- At each meal, offer one familiar "safe" food alongside a small amount of a new or less-liked food, without pressure. It can take many tries, often 10 or more, before a child accepts a new food.
- Let them touch, smell and explore food.
- Make small changes to safe foods (a different shape, a little sauce on the side).
- Keep mealtimes calm and regular. Avoid force-feeding, punishment or bribes.

See a health worker if your child is losing weight or not growing, eats very few foods, gags or chokes often, has ongoing constipation, or eats things that aren't food (such as soil, chalk or paint), which can be dangerous.$t$, $t$Sharp et al., Feeding problems and nutrient intake in children with autism spectrum disorders: a meta-analysis, Journal of Autism and Developmental Disorders (2013); NICE guideline CG170$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$My child will only eat a few foods. What can I do?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$My child is very sensitive to noise, light or touch. How can I help?$t$, $t$sensory issues
child covers ears at loud noise
hates clothes labels
sensory overload
child seeks spinning and jumping$t$, $t$Many autistic people feel sounds, lights, textures, smells or touch more strongly, or less strongly, than others. What feels ordinary to you can be painful for them.
- Notice what upsets them and what calms them.
- Offer ways to reduce overload: ear defenders or headphones, a cap or sunglasses, soft clothes with labels cut out, a quiet corner.
- Warn them before noisy events, and plan breaks.
- Some children seek sensation (spinning, jumping, chewing). Give safe ways to do it: a trampoline or jumping on a mattress, safe chew items, swings, or "heavy work" like carrying shopping.
- Don't force them to "get used to" something that hurts.

An occupational therapist can help if one is available. Tell a doctor if your child seems not to feel pain, as injuries and illness can be missed.$t$, $t$WHO, ICD-11 6A02 Autism spectrum disorder (sensory features); NICE guideline CG170; Lancet Commission on autism (2021)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$My child is very sensitive to noise, light or touch. How can I help?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$How do I toilet train a child with autism or developmental delay?$t$, $t$potty training autism
child still in nappies
child afraid of the toilet
toilet training special needs$t$, $t$Wait for signs of readiness: staying dry for an hour or two, noticing when wet or soiled, and being able to sit and follow a simple instruction.
- Use the same words and the same routine every time; a picture sequence of the steps helps.
- Take them to the toilet at regular times (after waking, after meals, before bed) for a few minutes, and praise any success.
- Make the toilet comfortable: a step for their feet, a smaller seat, and attention to sensory worries such as a cold seat or the sound of flushing.
- Expect it to take longer and accidents to happen. Never punish.

Constipation is common and makes training harder; treat it with a health worker's help. Ask a health worker if there is pain, blood, ongoing constipation, or no progress after several months.$t$, $t$NICE guideline CG170; NICE guideline CG99, Constipation in children and young people; WHO, Caregiver Skills Training programme$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$How do I toilet train a child with autism or developmental delay?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$How do I ask my child's school for support?$t$, $t$school won't accept my autistic child
classroom adjustments
talking to teachers about my child's needs
inclusive education rights
special needs at school$t$, $t$Ask for a meeting with the class teacher and the head teacher (or special needs coordinator). Bring a short note: your child's strengths, what they find hard, what helps at home, and any reports.

Agree on one or two practical changes to try first, for example: seating near the front and away from noise, instructions given in short steps, a picture timetable, extra time, a quiet place to calm down, or a named adult to go to. Ask how progress will be shared and set a date to review. Keep things in writing.

Children with disabilities have a right to inclusive education with reasonable accommodation under the UN Convention on the Rights of Persons with Disabilities (Article 24), which most African countries have ratified, and under the African Charter on the Rights and Welfare of the Child. A plan made in ANDA can help you write goals and share them with the school.$t$, $t$UN Convention on the Rights of Persons with Disabilities, Article 24; African Charter on the Rights and Welfare of the Child, Article 13; UNESCO, A guide for ensuring inclusion and equity in education (2017)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$How do I ask my child's school for support?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$What are the signs of dyslexia or a learning difficulty?$t$, $t$child struggles to read
poor spelling
reading problems at school
learning disability signs
my child mixes up letters$t$, $t$Dyslexia is a lasting difficulty with reading and spelling words accurately and fluently. It is not a problem of intelligence or effort. Signs can include:
- difficulty linking letters to their sounds
- reading slowly, with many guesses
- poor and inconsistent spelling
- avoiding reading aloud
- trouble with rhymes or breaking words into sounds
- a gap between how well a child speaks and understands, and how they read.

Learning in a language that isn't spoken at home can cause similar difficulties, so check whether the problem shows in the home language too. Get hearing and eyesight checked first, then ask the school for an assessment by an educational psychologist or learning support teacher. Structured phonics teaching, extra time, and hearing texts read aloud all help.$t$, $t$WHO, ICD-11 6A03.0 Developmental learning disorder with impairment in reading; International Dyslexia Association, definition of dyslexia (2002); Rose, Identifying and teaching children and young people with dyslexia and literacy difficulties (2009)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$What are the signs of dyslexia or a learning difficulty?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$I'm exhausted as a caregiver. Where can I get support?$t$, $t$parent burnout
I can't cope with my child
caregiver stress
I feel alone raising a special needs child
support for parents$t$, $t$Caring for a child with extra needs is hard. Feeling tired, sad, angry or alone is common, and it doesn't make you a bad parent.

Small things help:
- share care with a trusted relative, neighbour or friend, even for an hour
- take a short break for yourself every day
- sleep when you can
- talk to other parents who understand: a support group in ANDA's directory, or the ANDA community.

WHO's Caregiver Skills Training programme, run by some organisations in Africa, teaches parents practical skills and is designed to reduce stress; ask local organisations whether they offer it.

If you have felt hopeless for weeks, can't sleep or eat, or have thoughts of harming yourself or your child, please talk to a health worker now, or find a free crisis line for your country at findahelpline.com.$t$, $t$WHO, Caregiver Skills Training programme; WHO, mhGAP Intervention Guide version 2.0 (depression); Lancet Commission on autism (2021)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$I'm exhausted as a caregiver. Where can I get support?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$How do I explain a diagnosis to my child or family?$t$, $t$should I tell my child they are autistic
telling family about autism diagnosis
explaining ADHD to a child
family doesn't accept the diagnosis$t$, $t$Use simple, honest, positive words that fit their age, for example: "Your brain works in its own way. Some things are easier for you, like ..., and some things are harder, like ... That's okay, and we'll help." Talk about strengths as well as challenges, use stories with neurodivergent characters, and come back to it over time; it isn't a single talk. Many autistic adults say understanding their diagnosis helped them make sense of themselves.

For family members, explain what the diagnosis means and doesn't mean (it isn't caused by parenting or a curse, and it isn't catching), what helps your child, and how they can support you. Correct myths kindly.

You decide who needs to know. It is your child's information.$t$, $t$Lancet Commission on autism (2021); NICE guideline CG170 (information and support after diagnosis)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$How do I explain a diagnosis to my child or family?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$How can routines and visual schedules help?$t$, $t$picture schedule
my child hates changes in routine
visual timetable
how to prepare my child for changes$t$, $t$Many autistic children and children with ADHD cope better when they know what is coming. A visual schedule shows the steps of the day, or of one activity, in order, as photos, simple drawings or words: for example wake up, wash, dress, eat, school bag, go. No printer is needed.
- Go through it together in the morning, and move or tick off each step.
- Warn before changes ("5 more minutes, then bath"), using a timer or a song as the signal.
- When a change can't be avoided, show it on the schedule.
- Add choices (which shirt, which story) so your child has some control, and adjust the schedule as they grow.$t$, $t$Steinbrenner et al., Evidence-based practices for children, youth, and young adults with autism, National Clearinghouse on Autism Evidence and Practice (2020); NICE guideline CG170; WHO, Caregiver Skills Training programme$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$How can routines and visual schedules help?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$My child wanders off or runs away. How can I keep them safe?$t$, $t$child runs out of the house
autistic child goes missing
wandering autism safety
child escapes from school$t$, $t$Wandering is common in autistic children and can be dangerous, especially near roads and water. Drowning is one of the biggest risks.
- Fit high bolts and a bell on outside doors and gates.
- Fence or cover water: tanks, wells, ponds, pools.
- Tell neighbours and the school about the risk.
- Put your phone number on an ID bracelet or a card in their pocket, and keep a recent photo ready.
- Teach water safety, and swimming if possible.
- Practise "stop", and teach your name and phone number if they can learn them.

Look for what they run to or from (a noise, a favourite place) and change that if you can. If your child goes missing, check nearby water first, and get help immediately.$t$, $t$Anderson et al., Occurrence and family impact of elopement in children with autism spectrum disorders, Pediatrics (2012); Guan and Li, Injury mortality in individuals with autism, American Journal of Public Health (2017)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$My child wanders off or runs away. How can I keep them safe?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$Should my child take medicine for ADHD or autism?$t$, $t$ADHD medication
medicine for autism
Ritalin side effects
can I stop my child's medicine
medicine to calm my child$t$, $t$There is no medicine that treats autism itself. For ADHD, medicines can help many children with attention and impulsivity when other support isn't enough; for young children, parent training and classroom support are usually tried first. Doctors may also treat problems that can come with autism or ADHD, such as sleep problems, epilepsy, anxiety or very severe irritability.

Decisions about medicine must be made with a doctor who has assessed your child, with regular check-ups for side effects, growth and whether it is working. Never start, stop, share or change the dose of a medicine yourself, and don't buy medicines without a prescription. Good questions to ask the doctor: what is it for, which side effects should we watch for, and how long until we review it?$t$, $t$NICE guideline NG87, ADHD: diagnosis and management; NICE guideline CG170; Wolraich et al., AAP clinical practice guideline, Pediatrics (2019); WHO, mhGAP Intervention Guide version 2.0$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$Should my child take medicine for ADHD or autism?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$My child is being bullied. What can I do?$t$, $t$bullying at school
children tease my autistic child
my child is afraid to go to school
teacher beats my child$t$, $t$Children with disabilities are bullied more often than others. Signs include not wanting to go to school, lost or damaged belongings, unexplained injuries, sleep problems, or being more upset than usual.
- Listen calmly, believe them, and tell them it is not their fault.
- Write down what happened, when, and who was involved.
- Meet the teacher and head teacher, ask what they will do, and agree a date to follow up.
- Ask for a safe adult and a safe place at break times.
- Practise simple responses with your child and how to get help.

If the school doesn't act, contact the local education office. Physical punishment or abuse by staff is never acceptable. If there is violence or sexual abuse, or your child talks about harming themselves, get help immediately.$t$, $t$UN Convention on the Rights of Persons with Disabilities, Article 16; UNESCO, Behind the numbers: ending school violence and bullying (2019); Jones et al., Prevalence and risk of violence against children with disabilities: a systematic review and meta-analysis, The Lancet (2012)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$My child is being bullied. What can I do?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$What should I do if my child has a seizure?$t$, $t$seizure first aid
my child is having fits
convulsions
epilepsy and autism
what to do during a fit$t$, $t$Some autistic children and children with developmental conditions have epilepsy. During a seizure: stay calm and stay with them, time it, move hard or sharp things away, put something soft under their head, and once the shaking stops, turn them gently onto their side.

From CDC, "Don't take these actions":
"Don't hold the person down or stop their movements. This could injure you or them."
"Don't put anything in their mouth. This can hurt their teeth or jaw."
"Don't give mouth-to-mouth breaths during the seizure. People usually start breathing again on their own after a seizure."
"Don't offer water or food until they are fully alert. This is not necessary and could cause them to choke."

CDC says to call emergency help (in the US, 911; use your local emergency number) if:
"The seizure lasts longer than 5 minutes."
"They have another seizure soon after the first one."
"They have trouble breathing or waking up after the seizure."
"They are injured during the seizure."
"The seizure happens in water."

See a doctor after any first seizure. Epilepsy can be treated. It is not contagious and is not caused by spirits.$t$, $t$US CDC, First Aid for Seizures (2024), quoted text; WHO, Epilepsy fact sheet; WHO, mhGAP Intervention Guide version 2.0 (epilepsy). CDC material is used under CDC's reuse policy: it is available free on the CDC website, and its use here does not imply endorsement by CDC, HHS or the US Government.$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$What should I do if my child has a seizure?$t$);

insert into public.reviewed_answers (question, other_phrasings, answer, sources, written_by, status, approved_by, approved_at, review_due)
select $t$Can adults be diagnosed with autism or ADHD?$t$, $t$adult autism diagnosis
I think I have ADHD
late diagnosis
women and autism
assessment for adults$t$, $t$Yes. Many adults, especially women and girls, were missed as children and are diagnosed later. People often seek an assessment because of long-standing difficulties with social situations, sensory overload, organisation or focus, or a lifelong sense of being different.

A diagnosis can help people understand themselves, get adjustments at work or in study, and find support. Assessment is done by a psychiatrist or clinical psychologist experienced with adults: ask a doctor for a referral, and bring examples from childhood and, if possible, someone who knew you then. Online tests can help you decide whether to seek an assessment, but can't diagnose. Anxiety and depression often come alongside, and can be treated.$t$, $t$NICE guideline CG142, Autism spectrum disorder in adults: diagnosis and management; NICE guideline NG87; Lancet Commission on autism (2021)$t$, 'claude-ai-draft', 'approved', 'owner (review doc, 2026-11-27)', '2026-11-27T12:00:00Z', '2027-11-27'
where not exists (select 1 from public.reviewed_answers where question = $t$Can adults be diagnosed with autism or ADHD?$t$);
