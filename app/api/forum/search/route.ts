import { NextResponse } from 'next/server'
import { ForumService } from '@/lib/forum-service'
import { errorHandler, APIError } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.length < 2) {
      throw new APIError(400, 'INVALID_QUERY', 'Search query must be at least 2 characters')
    }

    const results = await ForumService.search(query, limit)
    return NextResponse.json(results)
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
