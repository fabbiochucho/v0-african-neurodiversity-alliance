"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Smartphone,
  Star,
  ExternalLink,
  Search,
  Heart,
  BookOpen,
  Eye,
  Calendar,
  MessageSquare,
  Wrench,
} from "lucide-react"

interface AppTool {
  id: string
  name: string
  developer: string
  description: string
  category: string
  type: "app" | "assistive_tech"
  platforms: string[]
  price: string
  url: string
  countryOrigin: string
  features: string[]
  rating: number
  reviews: number
  verified: boolean
}

interface AppToolRow {
  id: string
  name: string
  developer: string | null
  description: string | null
  category: string
  type: "app" | "assistive_tech"
  platforms: string[] | null
  price: string | null
  url: string | null
  country_origin: string | null
  features: string[] | null
  rating: number | null
  reviews: number | null
  verified: boolean | null
}

function mapRow(row: AppToolRow): AppTool {
  return {
    id: row.id,
    name: row.name,
    developer: row.developer || "",
    description: row.description || "",
    category: row.category,
    type: row.type,
    platforms: row.platforms || [],
    price: row.price || "Unknown",
    url: row.url || "",
    countryOrigin: row.country_origin || "",
    features: row.features || [],
    rating: row.rating || 0,
    reviews: row.reviews || 0,
    verified: row.verified || false,
  }
}

const categoryMeta: Record<string, { name: string; description: string; icon: typeof Smartphone; color: string }> = {
  communication: {
    name: "Communication",
    description: "Apps to support verbal and non-verbal communication",
    icon: MessageSquare,
    color: "bg-primary/10 text-primary",
  },
  learning: {
    name: "Learning & Education",
    description: "Educational tools and learning support apps",
    icon: BookOpen,
    color: "bg-secondary/10 text-secondary",
  },
  sensory: {
    name: "Sensory Support",
    description: "Tools for sensory processing and regulation",
    icon: Eye,
    color: "bg-accent/10 text-accent",
  },
  organization: {
    name: "Organization & Planning",
    description: "Time management and organizational tools",
    icon: Calendar,
    color: "bg-green-100 text-green-700",
  },
  social: {
    name: "Social Skills",
    description: "Apps to develop social interaction skills",
    icon: Heart,
    color: "bg-purple-100 text-purple-700",
  },
  wellness: {
    name: "Mental Wellness",
    description: "Mindfulness, relaxation, and emotional regulation",
    icon: Smartphone,
    color: "bg-blue-100 text-blue-700",
  },
}

const emptySubmission = {
  name: "",
  developer: "",
  description: "",
  category: "learning",
  type: "app",
  platforms: "",
  price: "",
  url: "",
  countryOrigin: "",
  submittedByEmail: "",
}

export default function AppsToolsPage() {
  const [items, setItems] = useState<AppTool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [activeTab, setActiveTab] = useState("apps")

  const [submitOpen, setSubmitOpen] = useState(false)
  const [submission, setSubmission] = useState(emptySubmission)
  const [submitting, setSubmitting] = useState(false)
  const [submitDone, setSubmitDone] = useState(false)

  const [ratingItem, setRatingItem] = useState<AppTool | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("apps_tools")
        .select("*")
        .eq("is_published", true)
        .order("rating", { ascending: false })

      setItems(((data as AppToolRow[]) || []).map(mapRow))
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!submission.name.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from("apps_tools_submissions").insert({
      name: submission.name.trim(),
      developer: submission.developer.trim() || null,
      description: submission.description.trim() || null,
      category: submission.category,
      type: submission.type,
      platforms: submission.platforms
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      price: submission.price.trim() || null,
      url: submission.url.trim() || null,
      country_origin: submission.countryOrigin.trim() || null,
      submitted_by_email: submission.submittedByEmail.trim() || null,
    })
    setSubmitting(false)
    if (!error) {
      setSubmitDone(true)
      setSubmission(emptySubmission)
    }
  }

  async function handleSubmitRating() {
    if (!ratingItem || ratingValue < 1) return
    setRatingSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from("apps_tools_reviews").insert({
      app_id: ratingItem.id,
      rating: ratingValue,
      comment: ratingComment.trim() || null,
    })
    setRatingSubmitting(false)
    if (!error) {
      setRatedIds((prev) => new Set(prev).add(ratingItem.id))
      setRatingItem(null)
      setRatingValue(0)
      setRatingComment("")
    }
  }

  const apps = items.filter((i) => i.type === "app")
  const assistiveTech = items.filter((i) => i.type === "assistive_tech")

  const activeList = activeTab === "apps" ? apps : assistiveTech

  const filtered = activeList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesPlatform =
      selectedPlatform === "all" || item.platforms.some((p) => p.toLowerCase() === selectedPlatform)
    return matchesSearch && matchesCategory && matchesPlatform
  })

  const categoryCounts = Object.keys(categoryMeta).reduce<Record<string, number>>((acc, key) => {
    acc[key] = apps.filter((a) => a.category === key).length
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Community Directory
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Apps & Tools for <span className="text-primary">Neurodivergent</span> Success
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Discover apps and assistive technologies, from Africa and around the world, that support
              neurodivergent individuals in communication, learning, organization, and daily life.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apps, tools, features..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryMeta).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the right tools for specific needs and challenges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryMeta).map(([key, meta]) => (
              <Card key={key} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${meta.color}`}>
                    <meta.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{meta.name}</CardTitle>
                  <CardDescription>{meta.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{categoryCounts[key] || 0} apps</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground"
                      onClick={() => {
                        setActiveTab("apps")
                        setSelectedCategory(key)
                      }}
                    >
                      Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="apps">Mobile Apps</TabsTrigger>
              <TabsTrigger value="assistive_tech">Assistive Tech</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Apps</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Real apps from Africa and around the world, rated by the community
                </p>
              </div>

              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    No apps found for this filter yet. Be the first to{" "}
                    <button className="underline" onClick={() => setSubmitOpen(true)}>
                      submit one
                    </button>
                    .
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((app) => (
                    <Card key={app.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Smartphone className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                                {app.name}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {categoryMeta[app.category]?.name || app.category}
                              </Badge>
                              {app.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                              {app.countryOrigin && (
                                <Badge variant="outline" className="text-xs">
                                  {app.countryOrigin}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <CardDescription className="text-sm">{app.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{app.rating}</span>
                              <span className="text-muted-foreground">({app.reviews})</span>
                            </div>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              disabled={ratedIds.has(app.id)}
                              onClick={() => {
                                setRatingItem(app)
                                setRatingValue(0)
                                setRatingComment("")
                              }}
                            >
                              {ratedIds.has(app.id) ? "Thanks for rating" : "Rate"}
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {app.platforms.map((platform) => (
                              <Badge key={platform} variant="secondary" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>

                          {app.developer && <div className="text-sm text-muted-foreground">Developer: {app.developer}</div>}

                          {app.features.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {app.features.slice(0, 3).map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-lg font-bold text-primary">{app.price}</div>
                            <Button size="sm" disabled={!app.url} asChild={Boolean(app.url)}>
                              {app.url ? (
                                <a href={app.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                                  View
                                </a>
                              ) : (
                                <span>View</span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="assistive_tech" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Assistive Technology</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Physical tools and devices to support daily living and learning
                </p>
              </div>

              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : filtered.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    No assistive tech listed for this filter yet. Be the first to{" "}
                    <button className="underline" onClick={() => setSubmitOpen(true)}>
                      submit one
                    </button>
                    .
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filtered.map((tech) => (
                    <Card key={tech.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{categoryMeta[tech.category]?.name || tech.category}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{tech.rating}</span>
                            <span className="text-xs text-muted-foreground">({tech.reviews})</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {tech.name}
                        </CardTitle>
                        <CardDescription>{tech.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-2xl font-bold text-primary">{tech.price}</div>

                          {tech.features.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Key Features:</h4>
                              <div className="flex flex-wrap gap-1">
                                {tech.features.map((feature) => (
                                  <Badge key={feature} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground"
                              disabled={!tech.url}
                              asChild={Boolean(tech.url)}
                            >
                              {tech.url ? (
                                <a href={tech.url} target="_blank" rel="noopener noreferrer">
                                  Find Suppliers
                                </a>
                              ) : (
                                <span>Find Suppliers</span>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              disabled={ratedIds.has(tech.id)}
                              onClick={() => {
                                setRatingItem(tech)
                                setRatingValue(0)
                                setRatingComment("")
                              }}
                            >
                              {ratedIds.has(tech.id) ? "Rated" : "Rate"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Accessibility First</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Entries in this directory are chosen for their real-world accessibility support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Visual Support</h3>
              <p className="text-sm text-muted-foreground">High contrast, large text, screen reader compatibility</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Audio Features</h3>
              <p className="text-sm text-muted-foreground">Voice output, sound control, audio descriptions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Wrench className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Motor Support</h3>
              <p className="text-sm text-muted-foreground">Switch control, touch sensitivity, gesture alternatives</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="font-semibold mb-2">Cognitive Support</h3>
              <p className="text-sm text-muted-foreground">
                Simple interfaces, clear navigation, customizable settings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-xl opacity-90 text-pretty mb-8 max-w-2xl mx-auto">
            Submit an app or tool that has helped you or your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => {
                setSubmission(emptySubmission)
                setSubmitDone(false)
                setSubmitOpen(true)
              }}
            >
              Suggest an App or Tool
            </Button>
          </div>
        </div>
      </section>

      {/* Submit dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          {submitDone ? (
            <>
              <DialogHeader>
                <DialogTitle>Thank you!</DialogTitle>
                <DialogDescription>
                  Your submission has been received and will be reviewed before being added to the directory.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setSubmitOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Suggest an App or Tool</DialogTitle>
                <DialogDescription>
                  Submissions are reviewed before being published to the directory.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Name *</Label>
                  <Input
                    id="app-name"
                    value={submission.name}
                    onChange={(e) => setSubmission({ ...submission, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-type">Type</Label>
                    <Select value={submission.type} onValueChange={(value) => setSubmission({ ...submission, type: value })}>
                      <SelectTrigger id="app-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="app">Mobile / Web App</SelectItem>
                        <SelectItem value="assistive_tech">Assistive Tech</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-category">Category</Label>
                    <Select
                      value={submission.category}
                      onValueChange={(value) => setSubmission({ ...submission, category: value })}
                    >
                      <SelectTrigger id="app-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryMeta).map(([key, meta]) => (
                          <SelectItem key={key} value={key}>
                            {meta.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-developer">Developer / Company</Label>
                  <Input
                    id="app-developer"
                    value={submission.developer}
                    onChange={(e) => setSubmission({ ...submission, developer: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-description">Description</Label>
                  <Textarea
                    id="app-description"
                    value={submission.description}
                    onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-platforms">Platforms (comma-separated)</Label>
                    <Input
                      id="app-platforms"
                      placeholder="iOS, Android, Web"
                      value={submission.platforms}
                      onChange={(e) => setSubmission({ ...submission, platforms: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-price">Price</Label>
                    <Input
                      id="app-price"
                      placeholder="Free, $9.99, etc."
                      value={submission.price}
                      onChange={(e) => setSubmission({ ...submission, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-url">Official URL</Label>
                  <Input
                    id="app-url"
                    value={submission.url}
                    onChange={(e) => setSubmission({ ...submission, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-country">Country of origin (optional)</Label>
                  <Input
                    id="app-country"
                    value={submission.countryOrigin}
                    onChange={(e) => setSubmission({ ...submission, countryOrigin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-your-email">Your email (optional, in case we have questions)</Label>
                  <Input
                    id="app-your-email"
                    value={submission.submittedByEmail}
                    onChange={(e) => setSubmission({ ...submission, submittedByEmail: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || !submission.name.trim()}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rate dialog */}
      <Dialog open={Boolean(ratingItem)} onOpenChange={(open) => !open && setRatingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {ratingItem?.name}</DialogTitle>
            <DialogDescription>Share your experience to help other families.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRatingValue(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
                  <Star
                    className={`h-7 w-7 ${n <= ratingValue ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-rating-comment">Comment (optional)</Label>
              <Textarea id="app-rating-comment" value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRating} disabled={ratingSubmitting || ratingValue < 1}>
              {ratingSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
