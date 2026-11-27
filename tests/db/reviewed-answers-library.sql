-- Level 1 retrieval checks on ANDA's real answer library (scripts/063), run in CI, inside a rolled-back transaction.
-- When a real question misses, add it here with the answer it should find.
\set ON_ERROR_STOP on
begin;

do $$
declare
  cases text[][] := array[
    array['my son does not respond when I call his name', 'What are the early signs of autism in young children?'],
    array['where can I get my daughter tested for autism', 'How do I get my child assessed or diagnosed?'],
    array['my child cannot sit still in class', 'What are the signs of ADHD?'],
    array['did the MMR vaccine cause autism', 'Do vaccines cause autism?'],
    array['my mother in law says my child is cursed', 'Is autism caused by bad parenting, a curse or witchcraft?'],
    array['is MMS safe for autism', 'Can autism be cured? Which treatments should we avoid?'],
    array['my child wakes up at night and will not sleep', 'How can we make bedtime and sleep easier?'],
    array['how to calm a meltdown', 'What should I do during a meltdown?'],
    array['my 3 year old is not talking', 'My child isn''t talking yet. How can I help with communication?'],
    array['he only eats rice and refuses new foods', 'My child will only eat a few foods. What can I do?'],
    array['she covers her ears at loud noise', 'My child is very sensitive to noise, light or touch. How can I help?'],
    array['potty training my autistic son', 'How do I toilet train a child with autism or developmental delay?'],
    array['the school will not make adjustments for my child', 'How do I ask my child''s school for support?'],
    array['my child struggles to read and spell', 'What are the signs of dyslexia or a learning difficulty?'],
    array['I am exhausted and cannot cope', 'I''m exhausted as a caregiver. Where can I get support?'],
    array['should I tell my child about the diagnosis', 'How do I explain a diagnosis to my child or family?'],
    array['visual schedule for routine changes', 'How can routines and visual schedules help?'],
    array['my child runs out of the house', 'My child wanders off or runs away. How can I keep them safe?'],
    array['side effects of ADHD medication', 'Should my child take medicine for ADHD or autism?'],
    array['other children bully my son at school', 'My child is being bullied. What can I do?'],
    array['first aid for a seizure', 'What should I do if my child has a seizure?'],
    array['can an adult get an ADHD diagnosis', 'Can adults be diagnosed with autism or ADHD?'],
    array['best football team in Lagos', '']
  ];
  got text;
  fails text := '';
begin
  for i in 1 .. array_length(cases, 1) loop
    got := (select question from public.search_reviewed_answers(cases[i][1], 1));
    if coalesce(got, '') <> cases[i][2] then
      fails := fails || format(E'\n  "%s" -> "%s" (expected "%s")', cases[i][1], coalesce(got, ''), cases[i][2]);
    end if;
  end loop;
  if fails <> '' then raise exception 'FAIL library retrieval:%', fails; end if;
end;
$$;
rollback;
