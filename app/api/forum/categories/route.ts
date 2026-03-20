import { NextResponse } from 'next/server'
import { ForumService } from '@/lib/forum-service'
import { errorHandler } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    const categories = await ForumService.getCategories()
    return NextResponse.json(categories)
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
