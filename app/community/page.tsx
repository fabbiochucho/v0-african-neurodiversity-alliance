"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  MessageCircle,
  Users,
  Heart,
  Pin,
  Search,
  Plus,
  TrendingUp,
  Shield,
  Globe,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  Flag,
  Star,
} from "lucide-react"

const forumCategories = [
  {
    id: "general",
    name: "General Discussion",
    description: "Open discussions about neurodiversity experiences",
    color: "bg-primary/10 text-primary",
    icon: MessageCircle,
  },
  {
    id: "parents",
    name: "Parents & Caregivers",
    description: "Support and advice for families",
    color: "bg-secondary/10 text-secondary",
    icon: Heart,
  },
  {
    id: "educators",
    name: "Educators & Professionals",
    description: "Resources and strategies for professionals",
    color: "bg-accent/10 text-accent",
    icon: Users,
  },
  {
    id: "country",
    name: "Country-Specific Groups",
    description: "Connect with people in your region",
    color: "bg-green-100 text-green-700",
    icon: Globe,
  },
  {
    id: "success",
    name: "Success Stories",
    description: "Share achievements and positive experiences",
    color: "bg-yellow-100 text-yellow-700",
    icon: Star,
  },
]

interface Post {
  id: string
  category: string
  title: string
  body: string
  isPinned: boolean
  createdAt: string
  authorName: string
  likeCount: number
  likedByMe: boolean
}

interface PostRow {
  id: string
  category: string
  title: string
  body: string
  is_pinned: boolean
  created_at: string
  profiles: { first_name: string | null; last_name: string | null } | null
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("categories")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const [postOpen, setPostOpen] = useState(false)
  const [postCategory, setPostCategory] = useState(forumCategories[0].id)
  const [postTitle, setPostTitle] = useState("")
  const [postBody, setPostBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)

  async function load() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUserId(user?.id || null)

    const { data } = await supabase
      .from("community_posts")
      .select("id, category, title, body, is_pinned, created_at, profiles(first_name, last_name)")
      .order("created_at", { ascending: false })

    const { data: likeRows } = await supabase.from("community_post_likes").select("post_id, user_id")

    const likeCounts = new Map<string, number>()
    const likedByMe = new Set<string>()
    for (const row of likeRows || []) {
      likeCounts.set(row.post_id, (likeCounts.get(row.post_id) || 0) + 1)
      if (user && row.user_id === user.id) likedByMe.add(row.post_id)
    }

    setPosts(
      ((data as unknown as PostRow[]) || []).map((row) => ({
        id: row.id,
        category: row.category,
        title: row.title,
        body: row.body,
        isPinned: row.is_pinned,
        createdAt: row.created_at,
        authorName: [row.profiles?.first_name, row.profiles?.last_name].filter(Boolean).join(" ") || "Community member",
        likeCount: likeCounts.get(row.id) || 0,
        likedByMe: likedByMe.has(row.id),
      })),
    )
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleToggleLike(post: Post) {
    if (!userId) {
      window.location.href = "/auth/login"
      return
    }
    const supabase = createClient()
    if (post.likedByMe) {
      await supabase.from("community_post_likes").delete().eq("post_id", post.id).eq("user_id", userId)
    } else {
      await supabase.from("community_post_likes").insert({ post_id: post.id, user_id: userId })
    }
    load()
  }

  async function handleSubmitPost() {
    if (!userId) {
      window.location.href = "/auth/login"
      return
    }
    if (!postTitle.trim() || !postBody.trim()) return

    setSubmitting(true)
    setPostError(null)
    const supabase = createClient()
    const { error } = await supabase.from("community_posts").insert({
      user_id: userId,
      category: postCategory,
      title: postTitle.trim(),
      body: postBody.trim(),
    })
    setSubmitting(false)

    if (error) {
      setPostError("Failed to post. Please try again.")
      return
    }

    setPostTitle("")
    setPostBody("")
    setPostOpen(false)
    setActiveTab("recent")
    load()
  }

  function openNewPost(categoryId?: string) {
    if (!userId) {
      window.location.href = "/auth/login"
      return
    }
    if (categoryId) setPostCategory(categoryId)
    setPostError(null)
    setPostOpen(true)
  }

  const trendingTopics = Object.entries(
    posts.reduce<Record<string, number>>((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1
      return acc
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([categoryId, count]) => ({
      tag: forumCategories.find((c) => c.id === categoryId)?.name || categoryId,
      posts: count,
    }))

  const visiblePosts = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Safe Community Space
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Connect, Share, and <span className="text-primary">Grow Together</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Join neurodivergent individuals, families, and professionals across Africa in our supportive
              community forums.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" onClick={() => openNewPost()}>
                <Plus className="mr-2 h-5 w-5" />
                Start a Discussion
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Discussion Categories", value: forumCategories.length, icon: MessageCircle },
              { label: "Total Posts", value: posts.length, icon: Users },
              { label: "Countries", value: 54, icon: Globe },
              { label: "Moderators", value: 0, icon: Shield },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Forum Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <TabsList className="grid w-full sm:w-auto grid-cols-2">
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="recent">Recent Posts</TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search discussions..." className="pl-10 sm:w-64" disabled title="Coming soon" />
                    </div>
                    <Button onClick={() => openNewPost()}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </div>
                </div>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                  {forumCategories.map((category) => {
                    const count = posts.filter((p) => p.category === category.id).length
                    return (
                      <Card
                        key={category.id}
                        className="group hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          setActiveCategory(category.id)
                          setActiveTab("recent")
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${category.color}`}>
                              <category.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    {category.name}
                                  </h3>
                                  <p className="text-muted-foreground text-sm mb-2">{category.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <MessageCircle className="h-3 w-3" />
                                      {count === 0 ? "No posts yet" : `${count} post${count === 1 ? "" : "s"}`}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </TabsContent>

                {/* Recent Posts Tab */}
                <TabsContent value="recent" className="space-y-4">
                  {activeCategory && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{forumCategories.find((c) => c.id === activeCategory)?.name}</span>
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => setActiveCategory(null)}>
                        Clear filter
                      </Button>
                    </div>
                  )}
                  {loading ? (
                    <p className="text-center py-12 text-muted-foreground">Loading...</p>
                  ) : visiblePosts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="h-10 w-10 mx-auto mb-4 opacity-50" />
                      <p className="font-medium mb-1">No discussions yet</p>
                      <p className="text-sm">Be the first to start a conversation in this community.</p>
                    </div>
                  ) : (
                    visiblePosts.map((post) => {
                      const category = forumCategories.find((c) => c.id === post.category)
                      return (
                        <Card key={post.id} className="group hover:shadow-md transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {post.authorName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                                    <Badge variant="outline" className="text-xs">
                                      {category?.name || post.category}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</div>
                                </div>

                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                                  {post.title}
                                </h3>

                                <div className="flex items-center gap-1 mb-3">
                                  <span className="text-sm text-muted-foreground">by</span>
                                  <span className="text-sm font-medium">{post.authorName}</span>
                                </div>

                                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.body}</p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1" title="Threaded replies coming soon">
                                      <MessageSquare className="h-4 w-4" />
                                      0
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ThumbsUp className="h-4 w-4" />
                                      {post.likeCount}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant={post.likedByMe ? "default" : "ghost"}
                                      aria-label="Like this post"
                                      onClick={() => handleToggleLike(post)}
                                    >
                                      <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                    <Button size="sm" variant="ghost" aria-label="Report this post" disabled title="Coming soon">
                                      <Flag className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Community Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>Be respectful and supportive of all community members</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                    <div>Share experiences and advice constructively</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <div>Respect privacy and confidentiality</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>Report inappropriate content to moderators</div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No trending topics yet.</p>
                  ) : (
                    trendingTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="text-sm font-medium">{topic.tag}</div>
                        <Badge variant="secondary" className="text-xs">
                          {topic.posts}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/directory">
                      <Users className="h-4 w-4 mr-2" />
                      Find Local Groups
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    disabled
                    title="Coming soon"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Private Messages
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    disabled
                    title="Coming soon"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    My Saved Posts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Your Voice Matters in Our Community</h2>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            Share your experiences, ask questions, and connect with others who understand your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => openNewPost()}>
              Join the Conversation
            </Button>
          </div>
        </div>
      </section>

      {/* New Post dialog */}
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a Discussion</DialogTitle>
            <DialogDescription>Share with the community. Be respectful and constructive.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-category">Category</Label>
              <Select value={postCategory} onValueChange={setPostCategory}>
                <SelectTrigger id="post-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {forumCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input id="post-title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-body">Message</Label>
              <Textarea id="post-body" rows={5} value={postBody} onChange={(e) => setPostBody(e.target.value)} />
            </div>
            {postError && <p className="text-sm text-destructive">{postError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPost} disabled={submitting || !postTitle.trim() || !postBody.trim()}>
              {submitting ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
