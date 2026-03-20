import { NextResponse } from "next/server"
import { getResourceService } from "@/lib/resource-service"
import { errorHandler } from "@/lib/error-handler"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const resourceService = await getResourceService()
    
    const filters = {
      category: searchParams.get("category") || undefined,
      type: searchParams.get("type") || undefined,
      country: searchParams.get("country") || undefined,
      search: searchParams.get("search") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      offset: parseInt(searchParams.get("offset") || "0"),
    }

    const { data, count } = await resourceService.getResources(filters)

    return NextResponse.json({
      data,
      count,
      limit: filters.limit,
      offset: filters.offset,
    })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
