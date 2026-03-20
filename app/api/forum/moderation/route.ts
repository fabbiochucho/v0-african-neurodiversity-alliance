import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ForumService } from '@/lib/forum-service'
import { errorHandler, APIError } from '@/lib/error-handler'
import { validateUUID } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new APIError(401, 'UNAUTHORIZED', 'User must be authenticated')
    }

    const { action, postId, reason } = await request.json()

    if (!postId || !validateUUID(postId)) {
      throw new APIError(400, 'INVALID_POST', 'Valid postId required')
    }

    // Check if user is moderator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isModerator = profile?.role === 'moderator' || profile?.role === 'admin'

    if (action === 'flag') {
      if (!reason) {
        throw new APIError(400, 'VALIDATION_ERROR', 'Reason required for flagging')
      }
      const result = await ForumService.flagPost(postId, reason)
      return NextResponse.json(result)
    }

    if (action === 'delete') {
      const result = await ForumService.deletePost(user.id, postId, isModerator)
      return NextResponse.json(result)
    }

    throw new APIError(400, 'INVALID_ACTION', 'Invalid moderation action')
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
