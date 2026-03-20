import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getResourceService } from "@/lib/resource-service"
import { errorHandler, APIError } from "@/lib/error-handler"
import { validateUUID } from "@/lib/validation"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new APIError(401, "UNAUTHORIZED", "User must be authenticated")
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")

    const resourceService = await getResourceService()
    const favorites = await resourceService.getUserFavorites(user.id, limit)

    return NextResponse.json(favorites)
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
      throw new APIError(401, "UNAUTHORIZED", "User must be authenticated")
    }

    const { resourceId } = await request.json()

    if (!validateUUID(resourceId)) {
      throw new APIError(400, "INVALID_RESOURCE_ID", "Valid resource ID is required")
    }

    const resourceService = await getResourceService()
    const favorite = await resourceService.addFavorite(resourceId, user.id)

    return NextResponse.json(favorite, { status: 201 })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new APIError(401, "UNAUTHORIZED", "User must be authenticated")
    }

    const { resourceId } = await request.json()

    if (!validateUUID(resourceId)) {
      throw new APIError(400, "INVALID_RESOURCE_ID", "Valid resource ID is required")
    }

    const resourceService = await getResourceService()
    await resourceService.removeFavorite(resourceId, user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
