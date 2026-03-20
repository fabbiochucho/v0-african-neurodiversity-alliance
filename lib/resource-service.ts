import { createClient } from "@/lib/supabase/server"
import { APIError } from "@/lib/error-handler"

export class ResourceService {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  // Get all resources with filtering
  async getResources(filters: {
    category?: string
    type?: string
    country?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = this.supabase.from("resources").select("*, resource_categories(name, type)")

    if (filters.category) {
      query = query.eq("resource_categories.id", filters.category)
    }

    if (filters.type) {
      query = query.eq("type", filters.type)
    }

    if (filters.country) {
      query = query.eq("country", filters.country)
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,specialties.cs.{"${filters.search}"}`
      )
    }

    const limit = filters.limit || 20
    const offset = filters.offset || 0

    const { data, error, count } = await query
      .eq("status", "approved")
      .range(offset, offset + limit - 1)
      .order("avg_rating", { ascending: false })

    if (error) throw new APIError(400, "FETCH_ERROR", error.message)

    return { data, count }
  }

  // Get single resource with reviews
  async getResourceWithReviews(resourceId: string) {
    const { data: resource, error: resourceError } = await this.supabase
      .from("resources")
      .select("*, resource_categories(name, type)")
      .eq("id", resourceId)
      .single()

    if (resourceError) throw new APIError(404, "NOT_FOUND", "Resource not found")

    const { data: reviews } = await this.supabase
      .from("resource_reviews")
      .select("*")
      .eq("resource_id", resourceId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(20)

    return { ...resource, reviews: reviews || [] }
  }

  // Add review for resource
  async addReview(
    resourceId: string,
    userId: string,
    review: {
      rating: number
      title: string
      content: string
    }
  ) {
    if (review.rating < 1 || review.rating > 5) {
      throw new APIError(400, "INVALID_RATING", "Rating must be between 1 and 5")
    }

    // Check if user already reviewed
    const { data: existing } = await this.supabase
      .from("resource_reviews")
      .select("id")
      .eq("resource_id", resourceId)
      .eq("user_id", userId)
      .single()

    if (existing) {
      throw new APIError(400, "ALREADY_REVIEWED", "You have already reviewed this resource")
    }

    const { data, error } = await this.supabase
      .from("resource_reviews")
      .insert({
        resource_id: resourceId,
        user_id: userId,
        rating: review.rating,
        title: review.title,
        content: review.content,
        is_verified_user: true,
      })
      .select()
      .single()

    if (error) throw new APIError(400, "CREATE_ERROR", error.message)

    // Update resource average rating
    await this.updateResourceRating(resourceId)

    return data
  }

  // Update resource rating
  private async updateResourceRating(resourceId: string) {
    const { data: reviews } = await this.supabase
      .from("resource_reviews")
      .select("rating")
      .eq("resource_id", resourceId)
      .eq("status", "published")

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      await this.supabase
        .from("resources")
        .update({
          avg_rating: Math.round(avgRating * 100) / 100,
          review_count: reviews.length,
        })
        .eq("id", resourceId)
    }
  }

  // Add resource to favorites
  async addFavorite(resourceId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("resource_favorites")
      .insert({
        resource_id: resourceId,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw new APIError(400, "FAVORITE_ERROR", error.message)

    return data
  }

  // Remove from favorites
  async removeFavorite(resourceId: string, userId: string) {
    const { error } = await this.supabase
      .from("resource_favorites")
      .delete()
      .eq("resource_id", resourceId)
      .eq("user_id", userId)

    if (error) throw new APIError(400, "UNFAVORITE_ERROR", error.message)
  }

  // Get user favorites
  async getUserFavorites(userId: string, limit = 20) {
    const { data, error } = await this.supabase
      .from("resource_favorites")
      .select("*, resources(*)")
      .eq("user_id", userId)
      .limit(limit)
      .order("created_at", { ascending: false })

    if (error) throw new APIError(400, "FETCH_ERROR", error.message)

    return data || []
  }

  // Search with advanced filters
  async advancedSearch(filters: {
    types?: string[]
    countries?: string[]
    languages?: string[]
    specialties?: string[]
    costRange?: string
    availability?: string
    verified_only?: boolean
    minRating?: number
  }) {
    let query = this.supabase.from("resources").select("*")

    if (filters.types && filters.types.length > 0) {
      query = query.in("type", filters.types)
    }

    if (filters.countries && filters.countries.length > 0) {
      query = query.in("country", filters.countries)
    }

    if (filters.languages && filters.languages.length > 0) {
      query = query.cs("languages", filters.languages)
    }

    if (filters.specialties && filters.specialties.length > 0) {
      query = query.cs("specialties", filters.specialties)
    }

    if (filters.costRange) {
      query = query.eq("cost_range", filters.costRange)
    }

    if (filters.availability) {
      query = query.eq("availability", filters.availability)
    }

    if (filters.verified_only) {
      query = query.eq("is_verified", true)
    }

    if (filters.minRating) {
      query = query.gte("avg_rating", filters.minRating)
    }

    const { data, error, count } = await query.eq("status", "approved").limit(100)

    if (error) throw new APIError(400, "SEARCH_ERROR", error.message)

    return { data, count }
  }
}

export async function getResourceService() {
  const supabase = await createClient()
  return new ResourceService(supabase)
}
