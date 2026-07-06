"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    description: row.description || "",
    contact: row.contact_info || {},
    verified: row.verified || false,
  }
}

const countries = [
  "All Countries",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Ghana",
  "Egypt",
  "Morocco",
  "Ethiopia",
  "Uganda",
  "Tanzania",
]
const resourceTypes = [
  { value: "all", label: "All Types", icon: Search },
  { value: "school", label: "Schools", icon: GraduationCap },
  { value: "therapist", label: "Therapists", icon: Heart },
  { value: "support_group", label: "Support Groups", icon: Users },
  { value: "healthcare", label: "Healthcare", icon: Stethoscope },
  { value: "caregiver", label: "Caregivers", icon: Heart },
]

export default function DirectoryPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("All Countries")
  const [selectedType, setSelectedType] = useState("all")
  const [activeTab, setActiveTab] = useState("list")

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
      resource.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCountry = selectedCountry === "All Countries" || resource.country === selectedCountry
    const matchesType = selectedType === "all" || resource.type === selectedType

    return matchesSearch && matchesCountry && matchesType
  })

  const getTypeIcon = (type: string) => {
    const typeConfig = resourceTypes.find((t) => t.value === type)
    return typeConfig ? typeConfig.icon : Search
  }

  const getTypeColor = (type: string) => {
    const colors = {
      school: "bg-primary/10 text-primary",
      therapist: "bg-accent/10 text-accent",
      support_group: "bg-secondary/10 text-secondary",
      healthcare: "bg-primary/10 text-primary",
      caregiver: "bg-accent/10 text-accent",
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

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SelectTrigger>
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
                <SelectTrigger>
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
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{filteredResources.length} resources found</p>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
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
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow">
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
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="ml-1 font-medium">{resource.rating}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">({resource.reviews} reviews)</span>
                          </div>

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
                            <Button size="sm" className="flex-1">
                              Contact
                            </Button>
                            <Button size="sm" variant="outline">
                              View Profile
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
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                <p className="text-muted-foreground mb-4">Map view will show resource locations across Africa</p>
                <Badge variant="outline">Coming Soon</Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Resource CTA */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h3>
            <p className="text-muted-foreground mb-4">Help us grow our directory by adding resources in your area</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>Add a Resource</Button>
              <Button variant="outline">Request Support in Your Area</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
