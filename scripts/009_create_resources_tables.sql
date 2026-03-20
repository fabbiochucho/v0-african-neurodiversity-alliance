-- Resource Directory Tables
-- Professionals, Organizations, Services, Reviews

CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- therapist, school, organization, tool, research
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES resource_categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- therapist, school, support_group, healthcare, caregiver, organization
  location VARCHAR(255),
  country VARCHAR(100),
  website_url VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  
  -- Service details
  specialties TEXT[], -- array of specialties
  languages TEXT[], -- array of languages
  accepts_insurance BOOLEAN DEFAULT FALSE,
  cost_range VARCHAR(50), -- free, low, medium, high
  availability VARCHAR(100), -- online, in_person, hybrid
  
  -- Verification and trust
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  verified_by UUID REFERENCES auth.users(id),
  credentials_provided BOOLEAN DEFAULT FALSE,
  
  -- Ratings and reviews
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, archived
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  is_verified_user BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'published', -- published, flagged, deleted
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(resource_id, user_id) -- One review per user per resource
);

CREATE TABLE IF NOT EXISTS resource_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Create indexes
CREATE INDEX idx_resources_category ON resources(category_id);
CREATE INDEX idx_resources_country ON resources(country);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_created ON resources(created_at DESC);
CREATE INDEX idx_resources_rating ON resources(avg_rating DESC);
CREATE INDEX idx_reviews_resource ON resource_reviews(resource_id);
CREATE INDEX idx_reviews_user ON resource_reviews(user_id);
CREATE INDEX idx_favorites_user ON resource_favorites(user_id);

-- Row Level Security
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Approved resources are viewable by everyone" ON resources
  FOR SELECT USING (status = 'approved' OR auth.uid() = created_by);

CREATE POLICY "Users can create resources" ON resources
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own resources" ON resources
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Published reviews are viewable" ON resource_reviews
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can create reviews" ON resource_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON resource_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Favorites are private" ON resource_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON resource_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON resource_favorites
  FOR DELETE USING (auth.uid() = user_id);
