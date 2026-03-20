import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getResourceService } from "@/lib/resource-service"
import { errorHandler, APIError } from "@/lib/error-handler"
import { validateUUID } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new APIError(401, "UNAUTHORIZED", "User must be authenticated")
    }

    const { resourceId, rating, title, content } = await request.json()

    if (!validateUUID(resourceId)) {
      throw new APIError(400, "INVALID_RESOURCE_ID", "Valid resource ID is required")
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new APIError(400, "INVALID_RATING", "Rating must be between 1 and 5")
    }

    if (!title || title.length < 5) {
      throw new APIError(400, "INVALID_TITLE", "Review title must be at least 5 characters")
    }

    if (!content || content.length < 10) {
      throw new APIError(400, "INVALID_CONTENT", "Review content must be at least 10 characters")
    }

    const resourceService = await getResourceService()
    const review = await resourceService.addReview(resourceId, user.id, {
      rating,
      title,
      content,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
