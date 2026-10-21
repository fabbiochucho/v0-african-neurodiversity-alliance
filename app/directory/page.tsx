"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ALL_NEURODIVERGENT, CONDITIONS, matchesCondition } from "@/lib/conditions"
import { Navigation } from "@/components/navigation"
import { AfricaMap } from "@/components/africa-map"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Filter,
  Heart,
  GraduationCap,
  Users,
  Stethoscope,
} from "lucide-react"

interface Resource {
  id: string
  name: string
  type: "school" | "therapist" | "support_group" | "healthcare" | "caregiver"
  location: string
  country: string
  rating: number
  reviews: number
  specialties: string[]
  conditions: string[]
  description: string
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  verified: boolean
}

// Row shape returned from the public.resources table (see
// scripts/009_create_resources_table.sql). Mapped into the Resource shape
// the rest of this page's filter/search UI already expects.
interface ResourceRow {
  id: string
  name: string
  category: Resource["type"]
  description: string | null
  country: string | null
  location: string | null
  rating: number | null
  reviews: number | null
  specialties: string[] | null
  conditions: string[] | null
  contact_info: { phone?: string; email?: string; website?: string } | null
  verified: boolean | null
}

function mapResourceRow(row: ResourceRow): Resource {
  return {
    id: row.id,
    name: row.name,
    type: row.category,
    location: row.location || row.country || "",
    country: row.country || "",
    rating: row.rating || 0,
    reviews: row.reviews || 0,
    specialties: row.specialties || [],
    conditions: row.conditions || [],
    description: row.description || "",
    contact: row.contact_info || {},
    verified: row.verified || false,
  }
}

const SORTS = [
  { value: "rating", label: "Highest rated" },
  { value: "reviews", label: "Most reviewed" },
  { value: "name", label: "Name (A to Z)" },
] as const
type Sort = (typeof SORTS)[number]["value"]
const resourceTypes = [
  { value: "all", label: "All Types", icon: Search },
  { value: "school", label: "Schools", icon: GraduationCap },
  { value: "therapist", label: "Therapists", icon: Heart },
  { value: "support_group", label: "Support Groups", icon: Users },
  { value: "healthcare", label: "Healthcare", icon: Stethoscope },
  { value: "caregiver", label: "Caregivers", icon: Heart },
]

const emptySubmission = {
  name: "",
  category: "support_group",
  country: "",
  location: "",
  description: "",
  phone: "",
  email: "",
  website: "",
  submittedByEmail: "",
  conditions: [] as string[],
}

export default function DirectoryPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("All Countries")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [activeTab, setActiveTab] = useState("list")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [minRating, setMinRating] = useState("0")
  const [contactNeeded, setContactNeeded] = useState<"any" | "phone" | "email" | "website">("any")
  const [sort, setSort] = useState<Sort>("rating")

  const [submitOpen, setSubmitOpen] = useState(false)
  const [submission, setSubmission] = useState(emptySubmission)
  const [submitting, setSubmitting] = useState(false)
  const [submitDone, setSubmitDone] = useState(false)

  const [ratingResource, setRatingResource] = useState<Resource | null>(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState("")
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set())

  async function handleSubmitResource() {
    if (!submission.name.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from("resource_submissions").insert({
      name: submission.name.trim(),
      category: submission.category,
      country: submission.country.trim() || null,
      location: submission.location.trim() || null,
      description: submission.description.trim() || null,
      contact_info: {
        ...(submission.phone.trim() && { phone: submission.phone.trim() }),
        ...(submission.email.trim() && { email: submission.email.trim() }),
        ...(submission.website.trim() && { website: submission.website.trim() }),
      },
      submitted_by_email: submission.submittedByEmail.trim() || null,
      conditions: submission.conditions,
    })
    setSubmitting(false)
    if (!error) {
      setSubmitDone(true)
      setSubmission(emptySubmission)
    }
  }

  async function handleSubmitRating() {
    if (!ratingResource || ratingValue < 1) return
    setRatingSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from("resource_reviews").insert({
      resource_id: ratingResource.id,
      rating: ratingValue,
      comment: ratingComment.trim() || null,
    })
    setRatingSubmitting(false)
    if (!error) {
      setRatedIds((prev) => new Set(prev).add(ratingResource.id))
      setRatingResource(null)
      setRatingValue(0)
      setRatingComment("")
    }
  }

  useEffect(() => {
    async function loadResources() {
      const supabase = createClient()
      const { data } = await supabase
        .from("resources")
        .select("*")
        .eq("is_published", true)
        .order("rating", { ascending: false })

      setResources(((data as ResourceRow[]) || []).map(mapResourceRow))
      setLoading(false)
    }
    loadResources()
  }, [])

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      resource.conditions.some((condition) => condition.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCountry = selectedCountry === "All Countries" || resource.country === selectedCountry
    const matchesType = selectedType === "all" || resource.type === selectedType

    const matchesConditionFilter = matchesCondition(resource.conditions, selectedCondition)

    const matchesAdvanced =
      (!verifiedOnly || resource.verified) &&
      resource.rating >= Number(minRating) &&
      (contactNeeded === "any" || Boolean(resource.contact[contactNeeded]))

    return matchesSearch && matchesCountry && matchesType && matchesConditionFilter && matchesAdvanced
  })
  filteredResources.sort((a, b) =>
    sort === "name" ? a.name.localeCompare(b.name) : sort === "reviews" ? b.reviews - a.reviews : b.rating - a.rating,
  )

  // Countries come from the listings themselves, so every listed country can be picked.
  const countries = ["All Countries", ...Array.from(new Set(resources.map((r) => r.country).filter(Boolean))).sort()]
  const byCountry = Object.entries(
    filteredResources.reduce<Record<string, number>>((acc, r) => {
      const c = r.country || "Country not given"
      acc[c] = (acc[c] || 0) + 1
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])
  const maxCount = byCountry[0]?.[1] || 1
  const advancedCount = [verifiedOnly, minRating !== "0", contactNeeded !== "any"].filter(Boolean).length

  const getTypeIcon = (type: string) => {
    const typeConfig = resourceTypes.find((t) => t.value === type)
    return typeConfig ? typeConfig.icon : Search
  }

  const getTypeColor = (type: string) => {
    const colors = {
      school: "bg-primary/10 text-primary",
      therapist: "bg-terracotta/10 text-terracotta",
      support_group: "bg-terracotta/10 text-terracotta",
      healthcare: "bg-primary/10 text-primary",
      caregiver: "bg-terracotta/10 text-terracotta",
    }
    return colors[type as keyof typeof colors] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-balance mb-4">Find Support Directory</h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            Connect with verified professionals, schools, support groups, and caregivers across Africa
          </p>
        </div>

        {/* Coverage gap notice */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
            <p className="text-sm text-pretty flex-1">
              <span className="font-semibold">Most organisations here focus on autism.</span> Support for ADHD,
              dyslexia, dyspraxia, dyscalculia and other neurodivergent conditions is much harder to find across
              Africa, and very few organisations cover them all. ANDA is bringing that support together in one place.
              Know an organisation that should be listed?
            </p>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => {
                setSubmitDone(false)
                setSubmitOpen(true)
              }}
            >
              Suggest an organisation
            </Button>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Country Filter */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger aria-label="Country">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger aria-label="Resource type">
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Condition Filter */}
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger aria-label="Condition">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value={ALL_NEURODIVERGENT}>Supports all neurodivergent people</SelectItem>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{filteredResources.length} resources found</p>
              <Button
                variant="outline"
                size="sm"
                aria-expanded={showAdvanced}
                aria-controls="advanced-filters"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                Advanced Filters{advancedCount > 0 && ` (${advancedCount})`}
              </Button>
            </div>

            {showAdvanced && (
              <div id="advanced-filters" className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <input
                    id="verified-only"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                  />
                  <Label htmlFor="verified-only">Verified only</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="min-rating">Minimum rating</Label>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger id="min-rating">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any rating</SelectItem>
                      {[3, 4, 4.5].map((r) => (
                        <SelectItem key={r} value={String(r)}>
                          {r} stars or more
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-needed">Can be contacted by</Label>
                  <Select value={contactNeeded} onValueChange={(v) => setContactNeeded(v as typeof contactNeeded)}>
                    <SelectTrigger id="contact-needed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any way</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sort-by">Sort by</Label>
                  <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                    <SelectTrigger id="sort-by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORTS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Toggle */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">Loading resources...</CardContent>
              </Card>
            ) : filteredResources.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or browse all resources</p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCountry("All Countries")
                      setSelectedType("all")
                      setSelectedCondition("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredResources.map((resource) => {
                  const TypeIcon = getTypeIcon(resource.type)
                  return (
                    <Card key={resource.id} className=" transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(resource.type)}`}
                            >
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-lg leading-tight">{resource.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{resource.location}</span>
                              </div>
                            </div>
                          </div>
                          {resource.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-brand-terracotta" />
                              <span className="ml-1 font-medium">{resource.rating}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">({resource.reviews} reviews)</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              disabled={ratedIds.has(resource.id)}
                              onClick={() => {
                                setRatingResource(resource)
                                setRatingValue(0)
                                setRatingComment("")
                              }}
                            >
                              {ratedIds.has(resource.id) ? "Thanks for rating" : "Rate"}
                            </Button>
                          </div>

                          {/* Conditions */}
                          {resource.conditions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {resource.conditions.map((condition) => (
                                <Badge
                                  key={condition}
                                  variant={condition === ALL_NEURODIVERGENT ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {condition === ALL_NEURODIVERGENT ? "Supports all neurodivergent people" : condition}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Specialties */}
                          <div className="flex flex-wrap gap-2">
                            {resource.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>

                          {/* Contact Info */}
                          <div className="space-y-2">
                            {resource.contact.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{resource.contact.phone}</span>
                              </div>
                            )}
                            {resource.contact.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{resource.contact.email}</span>
                              </div>
                            )}
                            {resource.contact.website && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-primary">{resource.contact.website}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              disabled={!resource.contact.phone && !resource.contact.email}
                              asChild={Boolean(resource.contact.phone || resource.contact.email)}
                            >
                              {resource.contact.phone ? (
                                <a href={`tel:${resource.contact.phone}`}>Call</a>
                              ) : resource.contact.email ? (
                                <a href={`mailto:${resource.contact.email}`}>Email</a>
                              ) : (
                                <span>Contact</span>
                              )}
                            </Button>
                            <Button size="sm" variant="outline" disabled={!resource.contact.website} asChild={Boolean(resource.contact.website)}>
                              {resource.contact.website ? (
                                <a
                                  href={
                                    resource.contact.website.startsWith("http")
                                      ? resource.contact.website
                                      : `https://${resource.contact.website}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Visit Website
                                </a>
                              ) : (
                                <span>Visit Website</span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                  Where support is listed
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
                <AfricaMap
                  counts={Object.fromEntries(byCountry)}
                  selected={selectedCountry === "All Countries" ? null : selectedCountry}
                  onSelect={(country) => {
                    setSelectedCountry(country)
                    setActiveTab("list")
                  }}
                />
                {byCountry.length === 0 ? (
                  <p className="text-muted-foreground">No resources match these filters.</p>
                ) : (
                  <ul className="space-y-2" aria-label="Resources by country">
                    {byCountry.map(([country, count]) => (
                      <li key={country}>
                        <button
                          type="button"
                          className="w-full text-left rounded-md p-2 hover:bg-muted focus-visible:outline focus-visible:outline-2"
                          disabled={country === "Country not given"}
                          onClick={() => {
                            setSelectedCountry(country)
                            setActiveTab("list")
                          }}
                        >
                          <span className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{country}</span>
                            <span>
                              {count} {count === 1 ? "resource" : "resources"}
                            </span>
                          </span>
                          <span className="block h-2 rounded bg-muted" aria-hidden="true">
                            <span className="block h-2 rounded bg-primary" style={{ width: `${(count / maxCount) * 100}%` }} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Resource CTA */}
        <Card className="bg-gradient-to-r from-primary/5 to-terracotta/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Can&apos;t find what you&apos;re looking for?</h3>
            <p className="text-muted-foreground mb-4">Help us grow our directory by adding resources in your area</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setSubmission(emptySubmission)
                  setSubmitDone(false)
                  setSubmitOpen(true)
                }}
              >
                Add a Resource
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmission(emptySubmission)
                  setSubmitDone(false)
                  setSubmitOpen(true)
                }}
              >
                Request Support in Your Area
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit a Resource dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                <DialogTitle>Add a Resource</DialogTitle>
                <DialogDescription>
                  Suggest a school, therapist, support group, or healthcare provider. Submissions are reviewed before
                  being published.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sub-name">Name *</Label>
                  <Input
                    id="sub-name"
                    value={submission.name}
                    onChange={(e) => setSubmission({ ...submission, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-category">Type</Label>
                    <Select
                      value={submission.category}
                      onValueChange={(value) => setSubmission({ ...submission, category: value })}
                    >
                      <SelectTrigger id="sub-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes
                          .filter((t) => t.value !== "all")
                          .map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-country">Country</Label>
                    <Input
                      id="sub-country"
                      value={submission.country}
                      onChange={(e) => setSubmission({ ...submission, country: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-location">Location / City</Label>
                  <Input
                    id="sub-location"
                    value={submission.location}
                    onChange={(e) => setSubmission({ ...submission, location: e.target.value })}
                  />
                </div>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Conditions supported</legend>
                  <div className="flex flex-wrap gap-2">
                    {[ALL_NEURODIVERGENT, ...CONDITIONS].map((condition) => {
                      const selected = submission.conditions.includes(condition)
                      return (
                        <Button
                          key={condition}
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          aria-pressed={selected}
                          className="h-7 text-xs"
                          onClick={() =>
                            setSubmission({
                              ...submission,
                              conditions: selected
                                ? submission.conditions.filter((c) => c !== condition)
                                : [...submission.conditions, condition],
                            })
                          }
                        >
                          {condition}
                        </Button>
                      )
                    })}
                  </div>
                </fieldset>
                <div className="space-y-2">
                  <Label htmlFor="sub-description">Description</Label>
                  <Textarea
                    id="sub-description"
                    value={submission.description}
                    onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-phone">Phone</Label>
                    <Input
                      id="sub-phone"
                      value={submission.phone}
                      onChange={(e) => setSubmission({ ...submission, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-email">Email</Label>
                    <Input
                      id="sub-email"
                      value={submission.email}
                      onChange={(e) => setSubmission({ ...submission, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-website">Website</Label>
                  <Input
                    id="sub-website"
                    value={submission.website}
                    onChange={(e) => setSubmission({ ...submission, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-your-email">Your email (optional, in case we have questions)</Label>
                  <Input
                    id="sub-your-email"
                    value={submission.submittedByEmail}
                    onChange={(e) => setSubmission({ ...submission, submittedByEmail: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitResource} disabled={submitting || !submission.name.trim()}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rate a Resource dialog */}
      <Dialog open={Boolean(ratingResource)} onOpenChange={(open) => !open && setRatingResource(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {ratingResource?.name}</DialogTitle>
            <DialogDescription>Share your experience to help other families.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatingValue(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-7 w-7 ${n <= ratingValue ? "fill-yellow-400 text-brand-terracotta" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating-comment">Comment (optional)</Label>
              <Textarea
                id="rating-comment"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingResource(null)}>
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
