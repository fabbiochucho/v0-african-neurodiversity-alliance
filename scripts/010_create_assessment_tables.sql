-- Assessment/Screening Tables
-- Self-screening assessments, domain scores, results

CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(100) NOT NULL, -- ADHD, Autism, Dyslexia, Dyscalculia, Anxiety, Depression
  age_group VARCHAR(50), -- child, teen, adult, all
  category VARCHAR(100), -- baseline, followup
  question_text TEXT NOT NULL,
  question_order INTEGER,
  cultural_context TEXT[], -- Array of relevant cultural contexts
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(domain, question_text, language)
);

CREATE TABLE IF NOT EXISTS assessment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  score_value INTEGER,
  option_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE,
  assessment_type VARCHAR(50) DEFAULT 'screening', -- screening, comprehensive
  age_group VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  completed BOOLEAN DEFAULT FALSE,
  progress_percentage INTEGER DEFAULT 0,
  
  -- Results
  adhd_score DECIMAL(5,2),
  autism_score DECIMAL(5,2),
  dyslexia_score DECIMAL(5,2),
  dyscalculia_score DECIMAL(5,2),
  anxiety_score DECIMAL(5,2),
  depression_score DECIMAL(5,2),
  
  -- Derived insights
  primary_domain VARCHAR(100),
  secondary_domains TEXT[],
  summary_insights TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id),
  option_id UUID NOT NULL REFERENCES assessment_options(id),
  response_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS domain_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  domain VARCHAR(100) NOT NULL, -- ADHD, Autism, etc.
  score DECIMAL(5,2),
  percentile INTEGER,
  interpretation VARCHAR(100), -- low, moderate, high, very_high
  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_assessment_questions_domain ON assessment_questions(domain);
CREATE INDEX idx_assessment_questions_age ON assessment_questions(age_group);
CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_learner ON assessments(learner_id);
CREATE INDEX idx_assessments_created ON assessments(created_at DESC);
CREATE INDEX idx_assessments_completed ON assessments(completed_at DESC) WHERE completed = TRUE;
CREATE INDEX idx_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX idx_domain_scores_assessment ON domain_scores(assessment_id);

-- Row Level Security
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Questions and options are public
CREATE POLICY "Assessment questions are viewable by everyone" ON assessment_questions
  FOR SELECT USING (true);

CREATE POLICY "Assessment options are viewable by everyone" ON assessment_options
  FOR SELECT USING (true);

-- Assessments - users can see own, admins can see all
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create assessments" ON assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Responses and scores follow assessment permissions
CREATE POLICY "Users can view own assessment responses" ON assessment_responses
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses for own assessment" ON assessment_responses
  FOR INSERT WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own domain scores" ON domain_scores
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid()
    )
  );
