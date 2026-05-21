import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user stats
    const stats = {
      assessmentCompleted: false,
      iepsCreated: 0,
      forumPosts: 0,
      coursesEnrolled: 0,
      resourcesSaved: 0,
    }

    // Fetch assessment data
    const { data: assessments } = await supabase
      .from('assessments')
      .select('status')
      .eq('user_id', user.id)
      .single()

    if (assessments?.status === 'completed') {
      stats.assessmentCompleted = true
    }

    // Fetch IEPs count
    const { data: ieps } = await supabase
      .from('ieps')
      .select('id', { count: 'exact' })
      .eq('created_by', user.id)

    stats.iepsCreated = ieps?.length ?? 0

    // Fetch forum posts count
    const { data: posts } = await supabase
      .from('forum_posts')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)

    stats.forumPosts = posts?.length ?? 0

    // Return stats
    return NextResponse.json(stats)
  } catch (error) {
    console.error('[v0] Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
