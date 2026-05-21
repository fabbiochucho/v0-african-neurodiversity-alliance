-- Task 4: Optimize Database Queries with Strategic Indexes
-- These indexes are designed to improve query performance for frequently accessed patterns

-- User and Authentication Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_user_id ON profiles(role, user_id);

-- Assessment Performance Indexes
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_learner_id ON assessments(learner_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(completed, created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id ON assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_user_id ON assessment_answers(user_id, created_at);

-- IEP and Goals Optimization
CREATE INDEX IF NOT EXISTS idx_ieps_user_id ON ieps(user_id);
CREATE INDEX IF NOT EXISTS idx_ieps_learner_id ON ieps(learner_id);
CREATE INDEX IF NOT EXISTS idx_iep_goals_iep_id ON iep_goals(iep_id);
CREATE INDEX IF NOT EXISTS idx_iep_goals_domain ON iep_goals(domain);
CREATE INDEX IF NOT EXISTS idx_iep_goals_status ON iep_goals(status, created_at);

-- Progress Tracking Optimization
CREATE INDEX IF NOT EXISTS idx_progress_logs_learner_id ON progress_logs(learner_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_goal_id ON progress_logs(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_date ON progress_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_progress_logs_learner_date ON progress_logs(learner_id, created_at DESC);

-- Forum and Community Optimization
CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user_post ON forum_likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_forum_moderations_status ON forum_moderations(status, created_at DESC);

-- Reports and Learning Optimization
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_courses_domain ON learning_courses(domain);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_course ON learning_progress(user_id, course_id);

-- Resources and Favorites Optimization
CREATE INDEX IF NOT EXISTS idx_resources_domain ON resources(domain);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resource_favorites_user_id ON resource_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_reviews_resource_id ON resource_reviews(resource_id);

-- Search Optimization with Full Text Indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_title_search ON forum_threads USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_forum_posts_content_search ON forum_posts USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_resources_title_search ON resources USING GIN(to_tsvector('english', title));

-- Advocacy Campaign Indexes
CREATE INDEX IF NOT EXISTS idx_advocacy_campaigns_status ON advocacy_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_advocacy_campaigns_created_at ON advocacy_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_supporters_campaign_id ON campaign_supporters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_supporters_user_id ON campaign_supporters(user_id);

-- Composite Indexes for Common Query Patterns
CREATE INDEX IF NOT EXISTS idx_assessments_user_date ON assessments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ieps_user_updated ON ieps(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_thread_activity ON forum_threads(category_id, created_at DESC, is_pinned);
CREATE INDEX IF NOT EXISTS idx_progress_learner_goal ON progress_logs(learner_id, goal_id, created_at DESC);

-- Analyze tables for query optimizer
ANALYZE profiles;
ANALYZE assessments;
ANALYZE assessment_answers;
ANALYZE ieps;
ANALYZE iep_goals;
ANALYZE progress_logs;
ANALYZE forum_threads;
ANALYZE forum_posts;
ANALYZE forum_likes;
ANALYZE resources;
ANALYZE resource_favorites;
ANALYZE learning_courses;
ANALYZE advocacy_campaigns;

-- Note: Remember to run EXPLAIN ANALYZE on frequently used queries to verify index usage
-- Monitor slow_log and pg_stat_statements for performance metrics
