import { NextResponse } from "next/server"
import { getResourceService } from "@/lib/resource-service"
import { errorHandler, APIError } from "@/lib/error-handler"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resourceService = await getResourceService()
    const resource = await resourceService.getResourceWithReviews(params.id)
    return NextResponse.json(resource)
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
