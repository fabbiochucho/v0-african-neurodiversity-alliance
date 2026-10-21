"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { CommunityReplies } from "@/components/community-replies"
import { useLang, useT } from "@/components/language-provider"
import type { MessageKey } from "@/lib/i18n"
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal"
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
  Trash2,
  Bookmark,
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
    color: "bg-terracotta/10 text-terracotta",
    icon: Heart,
  },
  {
    id: "educators",
    name: "Educators & Professionals",
    description: "Resources and strategies for professionals",
    color: "bg-terracotta/10 text-terracotta",
    icon: Users,
  },
  {
    id: "country",
    name: "Country-Specific Groups",
    description: "Connect with people in your region",
    color: "bg-primary/10 text-primary",
    icon: Globe,
  },
  {
    id: "success",
    name: "Success Stories",
    description: "Share achievements and positive experiences",
    color: "bg-terracotta/10 text-terracotta",
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
  mine: boolean
  likeCount: number
  likedByMe: boolean
  replyCount: number
  savedByMe: boolean
}

interface PostRow {
  id: string
  category: string
  title: string
  body: string
  is_pinned: boolean
  created_at: string
  user_id: string
  profiles: { first_name: string | null; last_name: string | null } | null
}

function timeAgo(iso: string, lang: string): string {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "short" })
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return rtf.format(-mins, "minute")
  const hours = Math.floor(mins / 60)
  if (hours < 24) return rtf.format(-hours, "hour")
  return rtf.format(-Math.floor(hours / 24), "day")
}

export default function CommunityPage() {
  const tr = useT()
  const lang = useLang()
  const cats = forumCategories.map((c) => ({
    ...c,
    name: tr(`comm.cat.${c.id}` as MessageKey),
    description: tr(`comm.cat.${c.id}.text` as MessageKey),
  }))
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("categories")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [savedOnly, setSavedOnly] = useState(false)
  const [openReplies, setOpenReplies] = useState<string | null>(null)

  const [postOpen, setPostOpen] = useState(false)
  const [postCategory, setPostCategory] = useState(cats[0].id)
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
      // The !user_id hint picks the author FK: likes also link posts to profiles, which makes a bare profiles(...) ambiguous.
      .select("id, category, title, body, is_pinned, created_at, user_id, profiles!user_id(first_name, last_name)")
      .order("created_at", { ascending: false })

    const { data: likeRows } = await supabase.from("community_post_likes").select("post_id, user_id")
    // ponytail: counts are tallied in the browser from every row; move to a count view once posts number in the thousands.
    const { data: replyRows } = await supabase.from("community_replies").select("post_id")
    const { data: savedRows } = user
      ? await supabase.from("community_saved_posts").select("post_id")
      : { data: [] as { post_id: string }[] }

    const replyCounts = new Map<string, number>()
    for (const row of replyRows || []) replyCounts.set(row.post_id, (replyCounts.get(row.post_id) || 0) + 1)
    const saved = new Set((savedRows || []).map((r) => r.post_id))

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
        authorName: [row.profiles?.first_name, row.profiles?.last_name].filter(Boolean).join(" "),
        mine: Boolean(user && row.user_id === user.id),
        likeCount: likeCounts.get(row.id) || 0,
        likedByMe: likedByMe.has(row.id),
        replyCount: replyCounts.get(row.id) || 0,
        savedByMe: saved.has(row.id),
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

  async function handleToggleSave(post: Post) {
    if (!userId) {
      window.location.href = "/auth/login"
      return
    }
    const supabase = createClient()
    if (post.savedByMe) {
      await supabase.from("community_saved_posts").delete().eq("post_id", post.id).eq("user_id", userId)
    } else {
      await supabase.from("community_saved_posts").insert({ post_id: post.id, user_id: userId })
    }
    load()
  }

  async function handleDeletePost(post: Post) {
    await createClient().from("community_posts").delete().eq("id", post.id)
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
      setPostError(tr("comm.postFailed"))
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
      tag: cats.find((c) => c.id === categoryId)?.name || categoryId,
      posts: count,
    }))

  const query = search.trim().toLowerCase()
  const visiblePosts = posts.filter(
    (p) =>
      (!activeCategory || p.category === activeCategory) &&
      (!savedOnly || p.savedByMe) &&
      (!query || p.title.toLowerCase().includes(query) || p.body.toLowerCase().includes(query)),
  )
  const filterLabel = [
    activeCategory && cats.find((c) => c.id === activeCategory)?.name,
    savedOnly && tr("comm.filterSaved"),
    query && tr("comm.filterMatching", { q: search.trim() }),
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-terracotta/5 to-terracotta/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              {tr("comm.badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              {tr("comm.heroA")} <span className="text-primary">{tr("comm.heroB")}</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              {tr("comm.heroText")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" onClick={() => openNewPost()}>
                <Plus className="mr-2 h-5 w-5" />
                {tr("comm.startDiscussion")}
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
              { label: tr("comm.statCategories"), value: cats.length, icon: MessageCircle },
              { label: tr("comm.statPosts"), value: posts.length, icon: Users },
              { label: tr("comm.statCountries"), value: 54, icon: Globe },
              { label: tr("comm.statModerators"), value: 0, icon: Shield },
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
                    <TabsTrigger value="categories">{tr("comm.tabCategories")}</TabsTrigger>
                    <TabsTrigger value="recent">{tr("comm.tabRecent")}</TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        aria-label={tr("comm.searchLabel")}
                        placeholder={tr("comm.searchPlaceholder")}
                        className="pl-10 sm:w-64"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value)
                          if (e.target.value) setActiveTab("recent")
                        }}
                      />
                    </div>
                    <Button onClick={() => openNewPost()}>
                      <Plus className="h-4 w-4 mr-2" />
                      {tr("comm.newPost")}
                    </Button>
                  </div>
                </div>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                  {cats.map((category) => {
                    const count = posts.filter((p) => p.category === category.id).length
                    return (
                      <Card
                        key={category.id}
                        className="group transition-colors cursor-pointer"
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
                                      {count === 0 ? tr("comm.noPostsYet") : tr(count === 1 ? "comm.onePost" : "comm.posts", { n: count })}
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
                  {filterLabel && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground" aria-live="polite">
                        Showing <span className="font-medium text-foreground">{filterLabel}</span> ({visiblePosts.length})
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveCategory(null)
                          setSavedOnly(false)
                          setSearch("")
                        }}
                      >
                        {tr("comm.clearFilter")}
                      </Button>
                    </div>
                  )}
                  {loading ? (
                    <p className="text-center py-12 text-muted-foreground">{tr("comm.loading")}</p>
                  ) : visiblePosts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="h-10 w-10 mx-auto mb-4 opacity-50" />
                      {filterLabel ? (
                        <p className="font-medium mb-1">{tr("comm.noMatch")}</p>
                      ) : (
                        <>
                          <p className="font-medium mb-1">{tr("comm.noDiscussions")}</p>
                          <p className="text-sm">{tr("comm.beFirst")}</p>
                        </>
                      )}
                    </div>
                  ) : (
                    visiblePosts.map((post) => {
                      const category = cats.find((c) => c.id === post.category)
                      return (
                        <Card key={post.id} className="group transition-colors">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {(post.authorName || tr("comm.memberFallback"))
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
                                  <div className="text-xs text-muted-foreground">{timeAgo(post.createdAt, lang)}</div>
                                </div>

                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                                  {post.title}
                                </h3>

                                <div className="flex items-center gap-1 mb-3">
                                  <span className="text-sm text-muted-foreground">{tr("comm.by")}</span>
                                  <span className="text-sm font-medium">{post.authorName || tr("comm.memberFallback")}</span>
                                </div>

                                <p
                                  className={`text-sm text-muted-foreground mb-3 whitespace-pre-wrap ${openReplies === post.id ? "" : "line-clamp-3"}`}
                                >
                                  {post.body}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="gap-1 px-2"
                                      aria-expanded={openReplies === post.id}
                                      aria-label={`${tr(post.replyCount === 1 ? "comm.oneReply" : "comm.replies", { n: post.replyCount })}. ${tr(openReplies === post.id ? "comm.hideReplies" : "comm.showReplies")}`}
                                      onClick={() => setOpenReplies(openReplies === post.id ? null : post.id)}
                                    >
                                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                                      {post.replyCount}
                                    </Button>
                                    <div className="flex items-center gap-1">
                                      <ThumbsUp className="h-4 w-4" />
                                      {post.likeCount}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant={post.likedByMe ? "default" : "ghost"}
                                      aria-label={tr("comm.like")}
                                      onClick={() => handleToggleLike(post)}
                                    >
                                      <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={post.savedByMe ? "default" : "ghost"}
                                      aria-label={post.savedByMe ? tr("comm.unsave") : tr("comm.save")}
                                      aria-pressed={post.savedByMe}
                                      onClick={() => handleToggleSave(post)}
                                    >
                                      <Bookmark className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                    {post.mine && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        aria-label={tr("comm.deletePost")}
                                        onClick={() => handleDeletePost(post)}
                                      >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                      </Button>
                                    )}
                                    <Button size="sm" variant="ghost" asChild>
                                      <a
                                        aria-label={tr("comm.report")}
                                        href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(`Report community post ${post.id}`)}&body=${encodeURIComponent(`Post: "${post.title}"
What's wrong:
`)}`}
                                      >
                                        <Flag className="h-4 w-4" aria-hidden="true" />
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                                {openReplies === post.id && (
                                  <CommunityReplies postId={post.id} userId={userId} onChange={load} />
                                )}
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
                    {tr("comm.guidelines")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>{tr("comm.rule1")}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0" />
                    <div>{tr("comm.rule2")}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-terracotta rounded-full mt-2 flex-shrink-0" />
                    <div>{tr("comm.rule3")}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>{tr("comm.rule4")}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-terracotta" />
                    {tr("comm.trending")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{tr("comm.noTrending")}</p>
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
                  <CardTitle>{tr("comm.quickActions")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                    <Link href="/directory">
                      <Users className="h-4 w-4 mr-2" />
                      {tr("comm.findGroups")}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      if (!userId) {
                        window.location.href = "/auth/login"
                        return
                      }
                      setSavedOnly(true)
                      setActiveTab("recent")
                    }}
                  >
                    <Bookmark className="h-4 w-4 mr-2" aria-hidden="true" />
                    {tr("comm.mySaved")}
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
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">{tr("comm.ctaTitle")}</h2>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            {tr("comm.ctaText")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" onClick={() => openNewPost()}>
              {tr("comm.join")}
            </Button>
          </div>
        </div>
      </section>

      {/* New Post dialog */}
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr("comm.startDiscussion")}</DialogTitle>
            <DialogDescription>{tr("comm.dialogText")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-category">{tr("comm.category")}</Label>
              <Select value={postCategory} onValueChange={setPostCategory}>
                <SelectTrigger id="post-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-title">{tr("comm.title")}</Label>
              <Input id="post-title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="post-body">{tr("comm.message")}</Label>
              <Textarea id="post-body" rows={5} value={postBody} onChange={(e) => setPostBody(e.target.value)} />
            </div>
            {postError && <p className="text-sm text-destructive">{postError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostOpen(false)}>
              {tr("comm.cancel")}
            </Button>
            <Button onClick={handleSubmitPost} disabled={submitting || !postTitle.trim() || !postBody.trim()}>
              {submitting ? tr("comm.posting") : tr("comm.post")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
