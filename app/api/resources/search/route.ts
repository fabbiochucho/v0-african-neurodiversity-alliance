import { NextResponse } from "next/server"
import { getResourceService } from "@/lib/resource-service"
import { errorHandler } from "@/lib/error-handler"

export async function POST(request: Request) {
  try {
    const filters = await request.json()

    // Validate and transform filters
    const searchFilters = {
      types: filters.types ? (Array.isArray(filters.types) ? filters.types : [filters.types]) : undefined,
      countries: filters.countries ? (Array.isArray(filters.countries) ? filters.countries : [filters.countries]) : undefined,
      languages: filters.languages ? (Array.isArray(filters.languages) ? filters.languages : [filters.languages]) : undefined,
      specialties: filters.specialties ? (Array.isArray(filters.specialties) ? filters.specialties : [filters.specialties]) : undefined,
      costRange: filters.costRange || undefined,
      availability: filters.availability || undefined,
      verified_only: filters.verified_only || false,
      minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
    }

    const resourceService = await getResourceService()
    const { data, count } = await resourceService.advancedSearch(searchFilters)

    return NextResponse.json({
      data,
      count,
      filters: searchFilters,
    })
  } catch (err) {
    const { status, body } = errorHandler(err)
    return NextResponse.json(body, { status })
  }
}
