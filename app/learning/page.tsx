"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Star, Search, GraduationCap, ExternalLink } from "lucide-react"

interface LearningResource {
  id: string
  title: string
  provider: string
  description: string
  format: string
  price: string
  platform: string
  url: string
  countryOrigin: string
  rating: number
  reviews: number
  verified: boolean
}

interface Row {
  id: string
  title: string
  provider: string | null
  description: string | null
  format: string
  price: string | null
  platform: string | null
  url: string | null
  country_origin: string | null
  rating: number | null
  reviews: number | null
  verified: boolean | null
}

function mapRow(row: Row): LearningResource {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider || "",
    description: row.description || "",
    format: row.format,
    price: row.price || "Unknown",
    platform: row.platform || "",
    url: row.url || "",
    countryOrigin: row.country_origin || "",
    rating: row.rating || 0,
    reviews: row.reviews || 0,
    verified: row.verified || false,
  }
}

const formatLabels: Record<string, string> = {
  course: "Course",
  certification: "Certification",
  webinar: "Webinar",
  training: "Training Program",
}

const emptySubmission = {
  title: "",
  provider: "",
  description: "",
  format: "course",
  price: "",
  platform: "",
  url: "",
  countryOrigin: "",
  submittedByEmail: "",
}

export default function LearningPage() {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("all")

  const [submitOpen, setSubmitOpen] = useState(false)
  const [submission, setSubmission] = useState(emptySubmission)
  const [submitting, setSubmitting] = useState(false)
  const [submitDone, setSubmitDone] = useState(false)

  const [ratingItem, setRatingItem] = useState<LearningResource | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("learning_resources")
        .select("*")
        .eq("is_published", true)
        .order("rating", { ascending: false })
      setResources(((data as Row[]) || []).map(mapRow))
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!submission.title.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from("learning_resource_submissions").insert({
      title: submission.title.trim(),
      provider: submission.provider.trim() || null,
      description: submission.description.trim() || null,
      format: submission.format,
      price: submission.price.trim() || null,
      platform: submission.platform.trim() || null,
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
    const { error } = await supabase.from("learning_resource_reviews").insert({
      resource_id: ratingItem.id,
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

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFormat = selectedFormat === "all" || r.format === selectedFormat
    return matchesSearch && matchesFormat
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Community-Curated Directory
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Learn, Grow, and <span className="text-primary">Empower</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Real courses, certifications, and webinars on neurodiversity, from Africa and around the world. ANDA
              doesn&apos;t host these directly — each links to the real provider.
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
                placeholder="Search courses, providers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="certification">Certifications</SelectItem>
                <SelectItem value="webinar">Webinars</SelectItem>
                <SelectItem value="training">Training Programs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Learning Resources</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {filtered.length} resource{filtered.length === 1 ? "" : "s"} found
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No resources found for this filter</p>
              <button className="text-sm underline" onClick={() => setSubmitOpen(true)}>
                Suggest one
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => (
                <Card key={r.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">{formatLabels[r.format] || r.format}</Badge>
                      {r.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{r.title}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{r.rating}</span>
                          <span className="text-muted-foreground">({r.reviews})</span>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          disabled={ratedIds.has(r.id)}
                          onClick={() => {
                            setRatingItem(r)
                            setRatingValue(0)
                            setRatingComment("")
                          }}
                        >
                          {ratedIds.has(r.id) ? "Thanks for rating" : "Rate"}
                        </Button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {r.provider && <div>Provider: {r.provider}</div>}
                        {r.platform && <div>Platform: {r.platform}</div>}
                        {r.countryOrigin && <div>Origin: {r.countryOrigin}</div>}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-lg font-bold text-primary">{r.price}</div>
                        <Button size="sm" disabled={!r.url} asChild={Boolean(r.url)}>
                          {r.url ? (
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Know a Great Learning Resource?</h2>
          <p className="text-xl opacity-90 text-pretty mb-8 max-w-2xl mx-auto">
            Help other families and professionals by suggesting a real course, certification, or webinar.
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
              Suggest a Resource
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
                <DialogTitle>Suggest a Learning Resource</DialogTitle>
                <DialogDescription>Submissions are reviewed before being published.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lr-title">Title *</Label>
                  <Input
                    id="lr-title"
                    value={submission.title}
                    onChange={(e) => setSubmission({ ...submission, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lr-format">Format</Label>
                    <Select value={submission.format} onValueChange={(value) => setSubmission({ ...submission, format: value })}>
                      <SelectTrigger id="lr-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="training">Training Program</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lr-provider">Provider</Label>
                    <Input
                      id="lr-provider"
                      value={submission.provider}
                      onChange={(e) => setSubmission({ ...submission, provider: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lr-description">Description</Label>
                  <Textarea
                    id="lr-description"
                    value={submission.description}
                    onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lr-platform">Platform</Label>
                    <Input
                      id="lr-platform"
                      placeholder="Coursera, provider's own site..."
                      value={submission.platform}
                      onChange={(e) => setSubmission({ ...submission, platform: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lr-price">Price</Label>
                    <Input
                      id="lr-price"
                      placeholder="Free, $29, etc."
                      value={submission.price}
                      onChange={(e) => setSubmission({ ...submission, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lr-url">URL</Label>
                  <Input
                    id="lr-url"
                    value={submission.url}
                    onChange={(e) => setSubmission({ ...submission, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lr-country">Country of origin (optional)</Label>
                  <Input
                    id="lr-country"
                    value={submission.countryOrigin}
                    onChange={(e) => setSubmission({ ...submission, countryOrigin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lr-email">Your email (optional)</Label>
                  <Input
                    id="lr-email"
                    value={submission.submittedByEmail}
                    onChange={(e) => setSubmission({ ...submission, submittedByEmail: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || !submission.title.trim()}>
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
            <DialogTitle>Rate {ratingItem?.title}</DialogTitle>
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
              <Label htmlFor="lr-rating-comment">Comment (optional)</Label>
              <Textarea id="lr-rating-comment" value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} />
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
