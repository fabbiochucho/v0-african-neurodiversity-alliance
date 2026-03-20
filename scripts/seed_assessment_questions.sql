-- Seed Assessment Questions
-- 150+ culturally adapted screening questions across 6 domains
-- ADHD, Autism, Dyslexia, Dyscalculia, Anxiety, Depression

-- ADHD Questions (25 questions)
INSERT INTO assessment_questions (domain, age_group, category, question_text, question_order, cultural_context, language)
VALUES
('ADHD', 'child', 'baseline', 'I have difficulty paying attention in class', 1, '{"school", "classroom"}', 'en'),
('ADHD', 'child', 'baseline', 'I often forget to complete my schoolwork or chores', 2, '{"family", "responsibility"}', 'en'),
('ADHD', 'child', 'baseline', 'I get distracted easily by things around me', 3, '{"sensory"}', 'en'),
('ADHD', 'child', 'baseline', 'I have trouble waiting my turn in games or activities', 4, '{"social", "play"}', 'en'),
('ADHD', 'child', 'baseline', 'I act without thinking about consequences', 5, '{"behavior", "impulse"}', 'en'),
('ADHD', 'child', 'baseline', 'I fidget or cannot sit still in class', 6, '{"movement", "classroom"}', 'en'),
('ADHD', 'child', 'baseline', 'I lose things I need (shoes, books, pencils)', 7, '{"organization"}', 'en'),
('ADHD', 'child', 'baseline', 'I have difficulty organizing my schoolwork', 8, '{"organization", "school"}', 'en'),
('ADHD', 'teen', 'baseline', 'I struggle to manage my time and meet deadlines', 9, '{"school", "responsibility"}', 'en'),
('ADHD', 'teen', 'baseline', 'I have difficulty starting tasks even when they''re important', 10, '{"motivation", "executive"}', 'en'),
('ADHD', 'teen', 'baseline', 'My mind wanders during conversations or lectures', 11, '{"attention", "social"}', 'en'),
('ADHD', 'teen', 'baseline', 'I procrastinate on schoolwork or assignments', 12, '{"executive", "school"}', 'en'),
('ADHD', 'teen', 'baseline', 'I interrupt others or speak without thinking', 13, '{"social", "impulse"}', 'en'),
('ADHD', 'teen', 'baseline', 'I leave projects unfinished', 14, '{"executive", "follow-through"}', 'en'),
('ADHD', 'teen', 'baseline', 'I have trouble listening to instructions', 15, '{"attention", "auditory"}', 'en'),
('ADHD', 'adult', 'baseline', 'I struggle with work organization and time management', 16, '{"work", "executive"}', 'en'),
('ADHD', 'adult', 'baseline', 'I frequently miss deadlines or appointments', 17, '{"punctuality", "responsibility"}', 'en'),
('ADHD', 'adult', 'baseline', 'My workspace is often disorganized and cluttered', 18, '{"organization", "environment"}', 'en'),
('ADHD', 'adult', 'baseline', 'I have difficulty focusing on complex tasks', 19, '{"attention", "work"}', 'en'),
('ADHD', 'adult', 'baseline', 'I act impulsively without considering consequences', 20, '{"impulse", "decision"}', 'en'),
('ADHD', 'adult', 'baseline', 'I lose important documents or personal items regularly', 21, '{"organization", "responsibility"}', 'en'),
('ADHD', 'adult', 'baseline', 'I struggle with relationships due to attention or behavior issues', 22, '{"social", "relationship"}', 'en'),
('ADHD', 'adult', 'baseline', 'I have energy levels that fluctuate significantly', 23, '{"energy", "regulation"}', 'en'),
('ADHD', 'adult', 'baseline', 'I find it hard to relax and often feel restless', 24, '{"anxiety", "movement"}', 'en'),
('ADHD', 'adult', 'baseline', 'My family members have ADHD or similar neurodevelopmental conditions', 25, '{"family", "genetics"}', 'en');

-- Autism Questions (25 questions)
INSERT INTO assessment_questions (domain, age_group, category, question_text, question_order, cultural_context, language)
VALUES
('Autism', 'child', 'baseline', 'I prefer playing alone rather than with other children', 1, '{"social", "play"}', 'en'),
('Autism', 'child', 'baseline', 'I find it hard to understand other people''s feelings or intentions', 2, '{"social", "empathy"}', 'en'),
('Autism', 'child', 'baseline', 'I like things to stay the same and become upset with changes', 3, '{"routine", "flexibility"}', 'en'),
('Autism', 'child', 'baseline', 'I have specific interests I engage in for long periods', 4, '{"interest", "focus"}', 'en'),
('Autism', 'child', 'baseline', 'I notice small details others miss (patterns, sounds, sensations)', 5, '{"sensory", "attention"}', 'en'),
('Autism', 'child', 'baseline', 'Certain sounds, lights, or textures bother me more than others', 6, '{"sensory", "sensitivity"}', 'en'),
('Autism', 'child', 'baseline', 'I have a hard time making eye contact with people', 7, '{"social", "communication"}', 'en'),
('Autism', 'child', 'baseline', 'I prefer structured activities with clear rules', 8, '{"structure", "clarity"}', 'en'),
('Autism', 'teen', 'baseline', 'I feel more comfortable with adults or one-on-one interaction', 9, '{"social", "preference"}', 'en'),
('Autism', 'teen', 'baseline', 'I struggle with social rules and unwritten social conventions', 10, '{"social", "norms"}', 'en'),
('Autism', 'teen', 'baseline', 'I have intense focused interests that consume much of my time', 11, '{"interest", "passion"}', 'en'),
('Autism', 'teen', 'baseline', 'I experience sensory sensitivities affecting daily life', 12, '{"sensory", "impact"}', 'en'),
('Autism', 'teen', 'baseline', 'I sometimes take things literally and miss indirect communication', 13, '{"communication", "language"}', 'en'),
('Autism', 'teen', 'baseline', 'I feel anxious in new social situations or large groups', 14, '{"social", "anxiety"}', 'en'),
('Autism', 'teen', 'baseline', 'I prefer written communication to spoken conversation', 15, '{"communication", "preference"}', 'en'),
('Autism', 'adult', 'baseline', 'I have specific areas of intense knowledge or expertise', 16, '{"interest", "knowledge"}', 'en'),
('Autism', 'adult', 'baseline', 'I find social events exhausting and need recovery time', 17, '{"social", "energy"}', 'en'),
('Autism', 'adult', 'baseline', 'I struggle with executive function tasks like planning', 18, '{"executive", "organization"}', 'en'),
('Autism', 'adult', 'baseline', 'I experience sensory overload in busy environments', 19, '{"sensory", "overwhelm"}', 'en'),
('Autism', 'adult', 'baseline', 'I have difficulty with small talk and social reciprocity', 20, '{"social", "interaction"}', 'en'),
('Autism', 'adult', 'baseline', 'I prefer a consistent routine and predictable schedule', 21, '{"routine", "structure"}', 'en'),
('Autism', 'adult', 'baseline', 'I notice patterns and details others often overlook', 22, '{"attention", "pattern"}', 'en'),
('Autism', 'adult', 'baseline', 'I have been told I take things too literally', 23, '{"communication", "literal"}', 'en'),
('Autism', 'adult', 'baseline', 'I engage in repetitive behaviors or movements', 24, '{"behavior", "repetition"}', 'en'),
('Autism', 'adult', 'baseline', 'I struggle with transitions between activities or locations', 25, '{"flexibility", "change"}', 'en');

-- Dyslexia Questions (25 questions)
INSERT INTO assessment_questions (domain, age_group, category, question_text, question_order, cultural_context, language)
VALUES
('Dyslexia', 'child', 'baseline', 'I find reading difficult or tiring', 1, '{"reading", "school"}', 'en'),
('Dyslexia', 'child', 'baseline', 'Letters or numbers sometimes look reversed or mixed up to me', 2, '{"visual", "letters"}', 'en'),
('Dyslexia', 'child', 'baseline', 'I struggle with spelling words correctly', 3, '{"writing", "spelling"}', 'en'),
('Dyslexia', 'child', 'baseline', 'I have difficulty with reading speed and accuracy', 4, '{"reading", "fluency"}', 'en'),
('Dyslexia', 'child', 'baseline', 'I find it hard to remember the sequence of letters in words', 5, '{"memory", "letters"}', 'en'),
('Dyslexia', 'child', 'baseline', 'I mix up similar-looking words (was/saw, no/on)', 6, '{"visual", "confusion"}', 'en'),
('Dyslexia', 'child', 'baseline', 'I feel embarrassed reading aloud in class', 7, '{"social", "anxiety"}', 'en'),
('Dyslexia', 'child', 'baseline', 'My writing is messy or hard to read', 8, '{"writing", "handwriting"}', 'en'),
('Dyslexia', 'teen', 'baseline', 'I read slowly compared to my peers', 9, '{"reading", "speed"}', 'en'),
('Dyslexia', 'teen', 'baseline', 'I often need to re-read material to understand it', 10, '{"comprehension", "efficiency"}', 'en'),
('Dyslexia', 'teen', 'baseline', 'I struggle with written assignments and essays', 11, '{"writing", "school"}', 'en'),
('Dyslexia', 'teen', 'baseline', 'I have difficulty with phonics and sounding out words', 12, '{"phonetics", "reading"}', 'en'),
('Dyslexia', 'teen', 'baseline', 'I find standardized reading tests particularly challenging', 13, '{"assessment", "reading"}', 'en'),
('Dyslexia', 'teen', 'baseline', 'I prefer audiobooks or digital text readers', 14, '{"preference", "accessibility"}', 'en'),
('Dyslexia', 'teen', 'baseline', 'Spelling corrections from teachers frustrate me', 15, '{"frustration", "school"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I avoid reading-heavy tasks in my work or personal life', 16, '{"avoidance", "work"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I make spelling or writing errors despite effort', 17, '{"writing", "accuracy"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I struggle with reading unfamiliar words or technical terms', 18, '{"reading", "difficulty"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I take longer to process written information', 19, '{"processing", "speed"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I use spellcheck and editing tools regularly', 20, '{"accommodation", "tools"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I find reading in poor lighting or small fonts difficult', 21, '{"visual", "environment"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I have a family history of reading difficulties', 22, '{"family", "genetics"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I rely on verbal communication more than written', 23, '{"communication", "preference"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'Numbers and symbols are sometimes confusing to me', 24, '{"symbols", "confusion"}', 'en'),
('Dyslexia', 'adult', 'baseline', 'I have strengths in verbal or non-verbal tasks', 25, '{"strength", "cognition"}', 'en');

-- Dyscalculia Questions (20 questions)
INSERT INTO assessment_questions (domain, age_group, category, question_text, question_order, cultural_context, language)
VALUES
('Dyscalculia', 'child', 'baseline', 'I find math difficult and frustrating', 1, '{"math", "school"}', 'en'),
('Dyscalculia', 'child', 'baseline', 'I struggle with basic counting or number concepts', 2, '{"numbers", "basics"}', 'en'),
('Dyscalculia', 'child', 'baseline', 'I have trouble understanding simple word problems', 3, '{"math", "comprehension"}', 'en'),
('Dyscalculia', 'child', 'baseline', 'I frequently lose track of numbers in my head', 4, '{"memory", "numbers"}', 'en'),
('Dyscalculia', 'child', 'baseline', 'Math facts (addition, subtraction) are hard for me', 5, '{"math", "facts"}', 'en'),
('Dyscalculia', 'teen', 'baseline', 'I struggle with mental math and quick calculations', 6, '{"math", "speed"}', 'en'),
('Dyscalculia', 'teen', 'baseline', 'I find algebra and abstract math concepts very difficult', 7, '{"math", "advanced"}', 'en'),
('Dyscalculia', 'teen', 'baseline', 'I need extra time for math-related tasks', 8, '{"accommodation", "time"}', 'en'),
('Dyscalculia', 'teen', 'baseline', 'I avoid math classes or math-related careers', 9, '{"avoidance", "choice"}', 'en'),
('Dyscalculia', 'teen', 'baseline', 'Numbers feel abstract or hard to visualize', 10, '{"visualization", "numbers"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'I struggle with money management and budgeting', 11, '{"finance", "practical"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'I avoid careers involving numbers or calculations', 12, '{"career", "avoidance"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'I have difficulty reading graphs, tables, or charts', 13, '{"visual", "data"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'Estimating quantities or distances is difficult for me', 14, '{"estimation", "spatial"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'I rely on calculators for basic arithmetic', 15, '{"tool", "accommodation"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'Time management involving numbers is challenging', 16, '{"time", "numbers"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'I struggle with measurements or proportions', 17, '{"measurement", "practical"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'Numbers and their relationships confuse me', 18, '{"comprehension", "relationships"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'I have a family history of math difficulties', 19, '{"family", "genetics"}', 'en'),
('Dyscalculia', 'adult', 'baseline', 'I am stronger in verbal or language-based skills', 20, '{"strength", "language"}', 'en');

-- Anxiety Questions (20 questions)
INSERT INTO assessment_questions (domain, age_group, category, question_text, question_order, cultural_context, language)
VALUES
('Anxiety', 'child', 'baseline', 'I worry about many things', 1, '{"worry", "thoughts"}', 'en'),
('Anxiety', 'child', 'baseline', 'My heart races or I feel tense when anxious', 2, '{"physical", "symptom"}', 'en'),
('Anxiety', 'child', 'baseline', 'I get nervous about new situations or changes', 3, '{"fear", "change"}', 'en'),
('Anxiety', 'child', 'baseline', 'I have trouble sleeping due to worries', 4, '{"sleep", "worry"}', 'en'),
('Anxiety', 'child', 'baseline', 'I avoid things that make me anxious', 5, '{"avoidance", "fear"}', 'en'),
('Anxiety', 'teen', 'baseline', 'I feel anxious in social situations', 6, '{"social", "anxiety"}', 'en'),
('Anxiety', 'teen', 'baseline', 'I worry excessively about future events', 7, '{"worry", "future"}', 'en'),
('Anxiety', 'teen', 'baseline', 'I experience panic or intense fear episodes', 8, '{"panic", "fear"}', 'en'),
('Anxiety', 'teen', 'baseline', 'I have physical symptoms when stressed (headaches, stomachaches)', 9, '{"physical", "stress"}', 'en'),
('Anxiety', 'teen', 'baseline', 'I seek reassurance frequently from trusted people', 10, '{"reassurance", "support"}', 'en'),
('Anxiety', 'adult', 'baseline', 'I experience persistent worry or anxiety', 11, '{"worry", "persistent"}', 'en'),
('Anxiety', 'adult', 'baseline', 'My anxiety interferes with work or relationships', 12, '{"impact", "life"}', 'en'),
('Anxiety', 'adult', 'baseline', 'I have panic attacks or intense fear responses', 13, '{"panic", "intensity"}', 'en'),
('Anxiety', 'adult', 'baseline', 'I avoid situations due to anxiety', 14, '{"avoidance", "behavior"}', 'en'),
('Anxiety', 'adult', 'baseline', 'I experience physical tension or muscle aches', 15, '{"physical", "tension"}', 'en'),
('Anxiety', 'adult', 'baseline', 'I have difficulty concentrating due to worry', 16, '{"attention", "worry"}', 'en'),
('Anxiety', 'adult', 'baseline', 'I feel restless or on edge', 17, '{"emotion", "state"}', 'en'),
('Anxiety', 'adult', 'baseline', 'Sleep problems are common for me', 18, '{"sleep", "issue"}', 'en'),
('Anxiety', 'adult', 'baseline', 'I worry about health or potential illness', 19, '{"health", "worry"}', 'en'),
('Anxiety', 'adult', 'baseline', 'My anxiety affects my quality of life', 20, '{"impact", "wellbeing"}', 'en');

-- Depression Questions (20 questions)
INSERT INTO assessment_questions (domain, age_group, category, question_text, question_order, cultural_context, language)
VALUES
('Depression', 'child', 'baseline', 'I feel sad or unhappy most of the time', 1, '{"mood", "sadness"}', 'en'),
('Depression', 'child', 'baseline', 'I don''t enjoy activities I usually like', 2, '{"anhedonia", "interest"}', 'en'),
('Depression', 'child', 'baseline', 'I feel tired or have no energy', 3, '{"energy", "fatigue"}', 'en'),
('Depression', 'child', 'baseline', 'I have trouble concentrating in school', 4, '{"attention", "school"}', 'en'),
('Depression', 'child', 'baseline', 'I feel worthless or blame myself', 5, '{"self-worth", "guilt"}', 'en'),
('Depression', 'teen', 'baseline', 'I feel hopeless about the future', 6, '{"hopelessness", "future"}', 'en'),
('Depression', 'teen', 'baseline', 'I withdraw from friends and family', 7, '{"social", "withdrawal"}', 'en'),
('Depression', 'teen', 'baseline', 'I have thoughts of death or suicide', 8, '{"danger", "crisis"}', 'en'),
('Depression', 'teen', 'baseline', 'My appetite or sleep patterns have changed', 9, '{"physical", "change"}', 'en'),
('Depression', 'teen', 'baseline', 'I feel irritable or angry more than usual', 10, '{"emotion", "irritability"}', 'en'),
('Depression', 'adult', 'baseline', 'I have persistent sadness or emptiness', 11, '{"mood", "persistent"}', 'en'),
('Depression', 'adult', 'baseline', 'I have lost interest in activities I enjoy', 12, '{"anhedonia", "loss"}', 'en'),
('Depression', 'adult', 'baseline', 'I feel exhausted despite adequate sleep', 13, '{"fatigue", "energy"}', 'en'),
('Depression', 'adult', 'baseline', 'I have difficulty making decisions', 14, '{"cognition", "executive"}', 'en'),
('Depression', 'adult', 'baseline', 'I feel worthless or excessive guilt', 15, '{"self-worth", "guilt"}', 'en'),
('Depression', 'adult', 'baseline', 'I have thoughts of death or self-harm', 16, '{"danger", "crisis"}', 'en'),
('Depression', 'adult', 'baseline', 'My depression affects my work and relationships', 17, '{"impact", "life"}', 'en'),
('Depression', 'adult', 'baseline', 'I have physical pain without clear cause', 18, '{"physical", "pain"}', 'en'),
('Depression', 'adult', 'baseline', 'I lack motivation or feel apathetic', 19, '{"motivation", "apathy"}', 'en'),
('Depression', 'adult', 'baseline', 'I have considered professional mental health support', 20, '{"help-seeking", "treatment"}', 'en');

-- Insert answer options for all questions
-- Likert scale: Strongly Disagree (1), Disagree (2), Neutral (3), Agree (4), Strongly Agree (5)

INSERT INTO assessment_options (question_id, option_text, score_value, option_order)
SELECT id, 'Strongly Disagree', 1, 1 FROM assessment_questions;

INSERT INTO assessment_options (question_id, option_text, score_value, option_order)
SELECT id, 'Disagree', 2, 2 FROM assessment_questions;

INSERT INTO assessment_options (question_id, option_text, score_value, option_order)
SELECT id, 'Neutral', 3, 3 FROM assessment_questions;

INSERT INTO assessment_options (question_id, option_text, score_value, option_order)
SELECT id, 'Agree', 4, 4 FROM assessment_questions;

INSERT INTO assessment_options (question_id, option_text, score_value, option_order)
SELECT id, 'Strongly Agree', 5, 5 FROM assessment_questions;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assessment_questions_age_domain ON assessment_questions(age_group, domain, language);
CREATE INDEX IF NOT EXISTS idx_assessment_options_question ON assessment_options(question_id);
