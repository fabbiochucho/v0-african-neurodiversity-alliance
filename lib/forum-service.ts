import { createClient } from '@/lib/supabase/server'
import { APIError } from '@/lib/error-handler'

export class ForumService {
  // Get all forum categories
  static async getCategories() {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw new APIError(400, 'DATABASE_ERROR', error.message)
    return data
  }

  // Get threads in a category
  static async getThreads(categoryId: string, page = 1, limit = 20) {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('forum_threads')
      .select('*, profiles:user_id(id, full_name, avatar_url)', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new APIError(400, 'DATABASE_ERROR', error.message)

    return {
      threads: data,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    }
  }

  // Create new thread
  static async createThread(userId: string, categoryId: string, title: string, content: string) {
    if (!title || !content) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Title and content required')
    }

    const supabase = await createClient()
    const slug = title.toLowerCase().replace(/\s+/g, '-').substring(0, 500)
    const excerpt = content.substring(0, 200)

    const { data, error } = await supabase
      .from('forum_threads')
      .insert({
        category_id: categoryId,
        user_id: userId,
        title,
        slug,
        content,
        excerpt,
        status: 'published',
      })
      .select()
      .single()

    if (error) throw new APIError(400, 'DATABASE_ERROR', error.message)
    return data
  }

  // Get thread with all posts
  static async getThread(threadId: string) {
    const supabase = await createClient()

    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .select('*, profiles:user_id(id, full_name, avatar_url)')
      .eq('id', threadId)
      .single()

    if (threadError) throw new APIError(404, 'NOT_FOUND', 'Thread not found')

    // Increment views
    await supabase
      .from('forum_threads')
      .update({ views: (thread.views || 0) + 1 })
      .eq('id', threadId)

    // Get posts
    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('*, profiles:user_id(id, full_name, avatar_url), forum_post_likes(id)')
      .eq('thread_id', threadId)
      .eq('status', 'published')
      .order('created_at', { ascending: true })

    if (postsError) throw new APIError(400, 'DATABASE_ERROR', postsError.message)

    return { thread, posts }
  }

  // Create post
  static async createPost(userId: string, threadId: string, content: string, parentPostId?: string) {
    if (!content) {
      throw new APIError(400, 'VALIDATION_ERROR', 'Content required')
    }

    const supabase = await createClient()

    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .insert({
        thread_id: threadId,
        user_id: userId,
        content,
        parent_post_id: parentPostId || null,
        status: 'published',
      })
      .select()
      .single()

    if (postError) throw new APIError(400, 'DATABASE_ERROR', postError.message)

    // Update thread replies count
    await supabase.rpc('increment_thread_replies', { thread_id: threadId })

    return post
  }

  // Like post
  static async likePost(userId: string, postId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('forum_post_likes')
      .insert({ post_id: postId, user_id: userId })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Already liked, remove like
        await supabase
          .from('forum_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        return { liked: false }
      }
      throw new APIError(400, 'DATABASE_ERROR', error.message)
    }

    // Update post likes count
    await supabase.rpc('increment_post_likes', { post_id: postId })

    return { liked: true, data }
  }

  // Search forum
  static async search(query: string, limit = 20) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('forum_threads')
      .select('*, profiles:user_id(id, full_name)')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('status', 'published')
      .limit(limit)

    if (error) throw new APIError(400, 'DATABASE_ERROR', error.message)
    return data
  }

  // Flag post for moderation
  static async flagPost(postId: string, reason: string) {
    const supabase = await createClient()

    const { error } = await supabase
      .from('forum_posts')
      .update({ status: 'flagged' })
      .eq('id', postId)

    if (error) throw new APIError(400, 'DATABASE_ERROR', error.message)

    // Log moderation action
    await supabase.from('forum_moderation').insert({
      post_id: postId,
      action: 'flagged',
      reason,
    })

    return { success: true }
  }

  // Delete post (admin only)
  static async deletePost(userId: string, postId: string, isModerator: boolean) {
    if (!isModerator) {
      throw new APIError(403, 'FORBIDDEN', 'Only moderators can delete posts')
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('forum_posts')
      .update({ status: 'deleted' })
      .eq('id', postId)

    if (error) throw new APIError(400, 'DATABASE_ERROR', error.message)

    // Log moderation
    await supabase.from('forum_moderation').insert({
      post_id: postId,
      moderator_id: userId,
      action: 'deleted',
    })

    return { success: true }
  }
}
