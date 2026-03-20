import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ForumService } from '@/lib/forum-service'
import { errorHandler, APIError } from '@/lib/error-handler'
import { validateUUID } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')

    if (!threadId || !validateUUID(threadId)) {
      throw new APIError(400, 'INVALID_THREAD', 'Valid threadId required')
    }

    const result = await ForumService.getThread(threadId)
    return NextResponse.json(result)
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new APIError(401, 'UNAUTHORIZED', 'User must be authenticated')
    }

    const { threadId, content, parentPostId } = await request.json()

    if (!threadId || !validateUUID(threadId)) {
      throw new APIError(400, 'INVALID_THREAD', 'Valid threadId required')
    }

    if (!content || typeof content !== 'string' || content.length < 2) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Content must be at least 2 characters')
    }

    const post = await ForumService.createPost(user.id, threadId, content, parentPostId)
    return NextResponse.json(post, { status: 201 })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
