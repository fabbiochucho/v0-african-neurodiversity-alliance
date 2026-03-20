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

    const { postId } = await request.json()

    if (!postId || !validateUUID(postId)) {
      throw new APIError(400, 'INVALID_POST', 'Valid postId required')
    }

    const result = await ForumService.likePost(user.id, postId)
    return NextResponse.json(result)
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
