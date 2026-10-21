"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ALL_NEURODIVERGENT, CONDITIONS, matchesCondition } from "@/lib/conditions"
import { Navigation } from "@/components/navigation"
import { AfricaMap } from "@/components/africa-map"
import { useT } from "@/components/language-provider"
import type { MessageKey } from "@/lib/i18n"
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
  const tr = useT()
  const cond = (c: string) => tr(`dir.cond.${c}` as MessageKey)
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
          <h1 className="text-4xl font-bold text-balance mb-4">{tr("dir.title")}</h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
            {tr("dir.intro")}
          </p>
        </div>

        {/* Coverage gap notice */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
            <p className="text-sm text-pretty flex-1">
              <span className="font-semibold">{tr("dir.gapTitle")}</span> {tr("dir.gapText")}
            </p>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => {
                setSubmitDone(false)
                setSubmitOpen(true)
              }}
            >
              {tr("dir.suggest")}
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
                  placeholder={tr("dir.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Country Filter */}
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger aria-label={tr("dir.country")}>
                  <SelectValue placeholder={tr("dir.selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country === "All Countries" ? tr("dir.allCountries") : country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger aria-label={tr("dir.typeLabel")}>
                  <SelectValue placeholder={tr("dir.typePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {tr(`dir.type.${type.value}` as MessageKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Condition Filter */}
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger aria-label={tr("dir.condition")}>
                  <SelectValue placeholder={tr("dir.condition")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tr("dir.allConditions")}</SelectItem>
                  <SelectItem value={ALL_NEURODIVERGENT}>{tr("dir.supportsAll")}</SelectItem>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {cond(condition)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{tr("dir.resultsFound", { n: filteredResources.length })}</p>
              <Button
                variant="outline"
                size="sm"
                aria-expanded={showAdvanced}
                aria-controls="advanced-filters"
                onClick={() => setShowAdvanced((v) => !v)}
              >
                <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                {tr("dir.advanced")}{advancedCount > 0 && ` (${advancedCount})`}
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
                  <Label htmlFor="verified-only">{tr("dir.verifiedOnly")}</Label>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="min-rating">{tr("dir.minRating")}</Label>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger id="min-rating">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{tr("dir.anyRating")}</SelectItem>
                      {[3, 4, 4.5].map((r) => (
                        <SelectItem key={r} value={String(r)}>
                          {tr("dir.starsOrMore", { n: r })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-needed">{tr("dir.contactBy")}</Label>
                  <Select value={contactNeeded} onValueChange={(v) => setContactNeeded(v as typeof contactNeeded)}>
                    <SelectTrigger id="contact-needed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{tr("dir.anyWay")}</SelectItem>
                      <SelectItem value="phone">{tr("dir.phone")}</SelectItem>
                      <SelectItem value="email">{tr("dir.email")}</SelectItem>
                      <SelectItem value="website">{tr("dir.website")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sort-by">{tr("dir.sortBy")}</Label>
                  <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                    <SelectTrigger id="sort-by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORTS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {tr(`dir.sort.${o.value}` as MessageKey)}
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
            <TabsTrigger value="list">{tr("dir.listView")}</TabsTrigger>
            <TabsTrigger value="map">{tr("dir.mapView")}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">{tr("dir.loading")}</CardContent>
              </Card>
            ) : filteredResources.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{tr("dir.noneFound")}</h3>
                  <p className="text-muted-foreground">{tr("dir.noneFoundText")}</p>
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
                    {tr("dir.clearFilters")}
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
                              {tr("dir.verified")}
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
                            <span className="text-sm text-muted-foreground">({tr("dir.reviews", { n: resource.reviews })})</span>
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
                              {ratedIds.has(resource.id) ? tr("dir.thanksRating") : tr("dir.rate")}
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
                                  {condition === ALL_NEURODIVERGENT ? tr("dir.supportsAll") : cond(condition)}
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
                                <a href={`tel:${resource.contact.phone}`}>{tr("dir.call")}</a>
                              ) : resource.contact.email ? (
                                <a href={`mailto:${resource.contact.email}`}>{tr("dir.email")}</a>
                              ) : (
                                <span>{tr("dir.contact")}</span>
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
                                  {tr("dir.visitWebsite")}
                                </a>
                              ) : (
                                <span>{tr("dir.visitWebsite")}</span>
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
                  {tr("dir.whereListed")}
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
                  <p className="text-muted-foreground">{tr("dir.noMatch")}</p>
                ) : (
                  <ul className="space-y-2" aria-label={tr("dir.byCountry")}>
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
                            <span className="font-medium">{country === "Country not given" ? tr("dir.noCountry") : country}</span>
                            <span>
                              {tr(count === 1 ? "dir.oneResource" : "dir.resources", { n: count })}
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
            <h3 className="text-xl font-semibold mb-2">{tr("dir.cantFind")}</h3>
            <p className="text-muted-foreground mb-4">{tr("dir.helpGrow")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setSubmission(emptySubmission)
                  setSubmitDone(false)
                  setSubmitOpen(true)
                }}
              >
                {tr("dir.addResource")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmission(emptySubmission)
                  setSubmitDone(false)
                  setSubmitOpen(true)
                }}
              >
                {tr("dir.requestSupport")}
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
                <DialogTitle>{tr("dir.thanks")}</DialogTitle>
                <DialogDescription>
                  {tr("dir.thanksText")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setSubmitOpen(false)}>{tr("dir.close")}</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{tr("dir.addResource")}</DialogTitle>
                <DialogDescription>
                  {tr("dir.addText")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sub-name">{tr("dir.nameRequired")}</Label>
                  <Input
                    id="sub-name"
                    value={submission.name}
                    onChange={(e) => setSubmission({ ...submission, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-category">{tr("dir.type")}</Label>
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
                              {tr(`dir.type.${type.value}` as MessageKey)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-country">{tr("dir.country")}</Label>
                    <Input
                      id="sub-country"
                      value={submission.country}
                      onChange={(e) => setSubmission({ ...submission, country: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-location">{tr("dir.location")}</Label>
                  <Input
                    id="sub-location"
                    value={submission.location}
                    onChange={(e) => setSubmission({ ...submission, location: e.target.value })}
                  />
                </div>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">{tr("dir.conditionsSupported")}</legend>
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
                          {condition === ALL_NEURODIVERGENT ? tr("dir.supportsAll") : cond(condition)}
                        </Button>
                      )
                    })}
                  </div>
                </fieldset>
                <div className="space-y-2">
                  <Label htmlFor="sub-description">{tr("dir.description")}</Label>
                  <Textarea
                    id="sub-description"
                    value={submission.description}
                    onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-phone">{tr("dir.phone")}</Label>
                    <Input
                      id="sub-phone"
                      value={submission.phone}
                      onChange={(e) => setSubmission({ ...submission, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-email">{tr("dir.email")}</Label>
                    <Input
                      id="sub-email"
                      value={submission.email}
                      onChange={(e) => setSubmission({ ...submission, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-website">{tr("dir.website")}</Label>
                  <Input
                    id="sub-website"
                    value={submission.website}
                    onChange={(e) => setSubmission({ ...submission, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub-your-email">{tr("dir.yourEmail")}</Label>
                  <Input
                    id="sub-your-email"
                    value={submission.submittedByEmail}
                    onChange={(e) => setSubmission({ ...submission, submittedByEmail: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitOpen(false)}>
                  {tr("dir.cancel")}
                </Button>
                <Button onClick={handleSubmitResource} disabled={submitting || !submission.name.trim()}>
                  {submitting ? tr("dir.submitting") : tr("dir.submit")}
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
            <DialogTitle>{tr("dir.rateName", { name: ratingResource?.name ?? "" })}</DialogTitle>
            <DialogDescription>{tr("dir.shareExperience")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatingValue(n)}
                  aria-label={tr(n === 1 ? "dir.oneStar" : "dir.stars", { n })}
                >
                  <Star
                    className={`h-7 w-7 ${n <= ratingValue ? "fill-yellow-400 text-brand-terracotta" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating-comment">{tr("dir.comment")}</Label>
              <Textarea
                id="rating-comment"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingResource(null)}>
              {tr("dir.cancel")}
            </Button>
            <Button onClick={handleSubmitRating} disabled={ratingSubmitting || ratingValue < 1}>
              {ratingSubmitting ? tr("dir.submitting") : tr("dir.submitRating")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
