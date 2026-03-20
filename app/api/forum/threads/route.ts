import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ForumService } from '@/lib/forum-service'
import { errorHandler, APIError } from '@/lib/error-handler'
import { validateUUID } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!categoryId || !validateUUID(categoryId)) {
      throw new APIError(400, 'INVALID_CATEGORY', 'Valid categoryId required')
    }

    const result = await ForumService.getThreads(categoryId, page, limit)
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

    const { categoryId, title, content } = await request.json()

    if (!categoryId || !validateUUID(categoryId)) {
      throw new APIError(400, 'INVALID_CATEGORY', 'Valid categoryId required')
    }

    if (!title || !content) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Title and content required')
    }

    const thread = await ForumService.createThread(user.id, categoryId, title, content)
    return NextResponse.json(thread, { status: 201 })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
