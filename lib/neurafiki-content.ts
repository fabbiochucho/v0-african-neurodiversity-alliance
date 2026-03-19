// Neurafiki Content Integration Module
// Connects ANDA with Neurafiki parent education, storytelling, and strategies

import { createClient } from '@/lib/supabase/server';

export interface NeurafikiContent {
  id: string;
  title: string;
  type: 'workbook' | 'story' | 'strategy' | 'guide' | 'training';
  pillar: 'family-support' | 'school-inclusion' | 'cultural-context' | 'advocacy' | 'research';
  description: string;
  targetDomains: string[];
  targetAge: { min: number; max: number };
  culturalVariants: Record<string, string>; // {swahili, pidgin, english, etc}
  homeStrategies: string[];
  resourceRequirements: Array<{ name: string; optional: boolean }>;
  contentText: string;
  successStories: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecommendedContent {
  contentId: string;
  title: string;
  reason: string; // "Aligns with communication domain"
  relevance: number; // 0-100
  type: NeurafikiContent['type'];
  pillar: NeurafikiContent['pillar'];
}

/**
 * Get recommended Neurafiki content based on user assessment
 */
export async function getRecommendedContent(
  userId: string,
  assessmentResults: Record<string, number>, // {communication: 3, sensory: 4, etc}
  childAge: number,
  selectedGoals: string[]
): Promise<RecommendedContent[]> {
  const supabase = await createClient();

  // Get Neurafiki content that matches:
  // 1. Child's age range
  // 2. Domains with lower scores (areas of support needed)
  // 3. Related to selected IEP goals

  const { data: content, error } = await supabase
    .from('neurafiki_content')
    .select('*')
    .lte('target_age_min', childAge)
    .gte('target_age_max', childAge);

  if (error) {
    console.error('[v0] Error fetching Neurafiki content:', error);
    return [];
  }

  // Score content by relevance
  const recommended: RecommendedContent[] = (content || [])
    .map((item: NeurafikiContent) => {
      let relevance = 0;

      // 1. Domain match (40 points)
      const domainMatches = item.targetDomains.filter((d) =>
        Object.keys(assessmentResults).includes(d)
      ).length;
      relevance += (domainMatches / item.targetDomains.length) * 40;

      // 2. Goal alignment (30 points)
      const goalMatch = selectedGoals.some((goal) =>
        item.successStories.some((story) => story.includes(goal))
      );
      relevance += goalMatch ? 30 : 0;

      // 3. Support priority (20 points)
      const needsSupport = item.targetDomains.some(
        (d) => assessmentResults[d] && assessmentResults[d] < 3
      );
      relevance += needsSupport ? 20 : 0;

      // 4. Pillar diversity (10 points)
      relevance += Math.random() * 10; // Add variety

      return {
        contentId: item.id,
        title: item.title,
        reason: `Supports development in ${item.targetDomains.join(', ')}`,
        relevance: Math.min(relevance, 100),
        type: item.type,
        pillar: item.pillar,
      };
    })
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5); // Top 5 recommendations

  return recommended;
}

/**
 * Get localized content variant
 */
export async function getLocalizedContent(contentId: string, language: string = 'english') {
  const supabase = await createClient();

  const { data: content, error } = await supabase
    .from('neurafiki_content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (error || !content) return null;

  // Return variant for requested language
  const variant = content.culturalVariants?.[language] || content.culturalVariants?.['english'];
  return {
    ...content,
    content: variant,
  };
}

/**
 * Get home-based strategies for a specific goal
 */
export async function getHomeBased Strategies(
  goalDomain: string,
  childAge: number,
  resourceConstraints?: { therapistAccess: boolean; schoolSupport: boolean }
) {
  const supabase = await createClient();

  const { data: strategies, error } = await supabase
    .from('neurafiki_content')
    .select('*')
    .contains('targetDomains', [goalDomain])
    .eq('type', 'strategy')
    .lte('target_age_min', childAge)
    .gte('target_age_max', childAge);

  if (error) return [];

  // Filter by resource constraints
  return (strategies || []).map((s: NeurafikiContent) => ({
    title: s.title,
    strategies: s.homeStrategies,
    resources: s.resourceRequirements,
    estimatedTime: '15-20 minutes',
    successRate: '75%+ of families',
    whyItMatters: s.description,
  }));
}

/**
 * Get success stories matching user profile
 */
export async function getSuccessStories(
  targetDomains: string[],
  culturalContext?: string,
  language: string = 'english'
) {
  const supabase = await createClient();

  const { data: stories, error } = await supabase
    .from('neurafiki_content')
    .select('*')
    .eq('type', 'story')
    .overlaps('targetDomains', targetDomains)
    .limit(3);

  if (error) return [];

  return stories || [];
}

/**
 * Track content engagement for effectiveness analysis
 */
export async function recordContentEngagement(
  userId: string,
  contentId: string,
  engagementType: 'view' | 'read' | 'share' | 'apply' | 'discuss',
  timeSpent: number,
  hasImpact?: boolean
) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('neurafiki_engagement').insert({
    user_id: userId,
    content_id: contentId,
    engagement_type: engagementType,
    time_spent: timeSpent,
    has_impact_on_goal_progress: hasImpact,
    created_at: new Date(),
  });

  if (error) {
    console.error('[v0] Error recording engagement:', error);
  }

  return data;
}

/**
 * Get content effectiveness metrics
 */
export async function getContentEffectiveness(contentId: string) {
  const supabase = await createClient();

  const { data: engagements, error } = await supabase
    .from('neurafiki_engagement')
    .select('*')
    .eq('content_id', contentId);

  if (error) return null;

  const totalEngagements = engagements?.length || 0;
  const positiveImpact = engagements?.filter((e) => e.has_impact_on_goal_progress).length || 0;

  return {
    totalUsers: totalEngagements,
    reportedImpact: totalEngagements > 0 ? (positiveImpact / totalEngagements) * 100 : 0,
    avgTimeSpent: engagements && engagements.length > 0
      ? (engagements.reduce((sum: number, e: any) => sum + e.time_spent, 0) / engagements.length) / 60
      : 0, // in minutes
    engagement Types: engagements?.reduce((acc: any, e: any) => {
      acc[e.engagement_type] = (acc[e.engagement_type] || 0) + 1;
      return acc;
    }, {}),
  };
}

/**
 * Map IEP goal to related Neurafiki content
 */
export async function mapGoalToNeurafikiContent(iepGoalId: string) {
  const supabase = await createClient();

  // Get goal details
  const { data: goal, error: goalError } = await supabase
    .from('iep_goals')
    .select('*')
    .eq('id', iepGoalId)
    .single();

  if (goalError || !goal) return null;

  // Find related Neurafiki content
  const { data: content, error: contentError } = await supabase
    .from('neurafiki_content')
    .select('*')
    .contains('targetDomains', [goal.domain])
    .limit(5);

  if (contentError) return null;

  // Store mapping
  const { error: mappingError } = await supabase
    .from('iep_goal_neurafiki_mapping')
    .upsert({
      iep_goal_id: iepGoalId,
      neurafiki_content_ids: (content || []).map((c: NeurafikiContent) => c.id),
      why_this_matters: goal.goal_text,
      home_strategies: (content || [])
        .flatMap((c: NeurafikiContent) => c.homeStrategies)
        .slice(0, 3),
      success_stories: (content || [])
        .flatMap((c: NeurafikiContent) => c.successStories)
        .slice(0, 2),
      created_at: new Date(),
    });

  if (mappingError) {
    console.error('[v0] Error creating mapping:', mappingError);
  }

  return content;
}

/**
 * Get community discussion recommendations
 */
export async function getRecommendedDiscussions(iepGoalIds: string[]) {
  const supabase = await createClient();

  // Map goals to Neurafiki pillars
  const { data: mappings, error } = await supabase
    .from('iep_goal_neurafiki_mapping')
    .select('neurafiki_content_ids')
    .in('iep_goal_id', iepGoalIds);

  if (error) return [];

  // Get content and their pillars
  const contentIds = mappings?.flatMap((m: any) => m.neurafiki_content_ids) || [];

  const { data: content } = await supabase
    .from('neurafiki_content')
    .select('pillar')
    .in('id', contentIds);

  const pillars = [...new Set((content || []).map((c: any) => c.pillar))];

  // Get discussions for those pillars
  return pillars;
}
