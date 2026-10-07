import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Download,
  BookOpen,
  BarChart3,
  Globe,
  Award,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  ChevronRight,
} from "lucide-react"

const researchCategories = [
  {
    id: "prevalence",
    name: "Prevalence Studies",
    description: "Population-based research on neurodivergent prevalence in Africa",
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "interventions",
    name: "Interventions & Treatments",
    description: "Evidence-based interventions and therapeutic approaches",
    icon: Heart,
    color: "bg-secondary/10 text-secondary",
  },
  {
    id: "education",
    name: "Educational Research",
    description: "Studies on inclusive education and learning strategies",
    icon: BookOpen,
    color: "bg-accent/10 text-accent",
  },
  {
    id: "cultural",
    name: "Cultural & Social Studies",
    description: "Research on cultural perspectives and social factors",
    icon: Globe,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "policy",
    name: "Policy & Systems Research",
    description: "Studies on healthcare systems and policy effectiveness",
    icon: Award,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "technology",
    name: "Technology & Innovation",
    description: "Research on assistive technology and digital interventions",
    icon: TrendingUp,
    color: "bg-blue-100 text-blue-700",
  },
]

// Research listings are sourced from real, verified submissions only --
// no placeholder/example studies. This page shows an empty state until
// real research is submitted and published.
const featuredResearch: Array<{
  id: number
  title: string
  authors: string[]
  institution: string
  journal: string
  year: number
  type: string
  category: string
  abstract: string
  keywords: string[]
  citations: number
  downloads: number
  openAccess: boolean
  doi: string
  country: string
  language: string
  pages: number
}> = []

const ongoingStudies: Array<{
  id: number
  title: string
  leadInstitution: string
  countries: number
  participants: number
  startDate: string
  expectedCompletion: string
  funding: string
  status: string
  description: string
}> = []

const researchTools: Array<{
  id: number
  name: string
  description: string
  type: string
  languages: string[]
  validation: string
  downloads: number
  openAccess: boolean
}> = []

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Research & Evidence
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Advancing <span className="text-primary">Neurodiversity Research</span> in Africa
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Access the latest research, studies, and evidence-based practices in neurodiversity from African
              institutions and researchers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Browse Research
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                Submit Research
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Research Stats */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{featuredResearch.length}</div>
              <div className="text-sm text-muted-foreground">Published Studies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">
                {new Set(featuredResearch.map((s) => s.institution)).size}
              </div>
              <div className="text-sm text-muted-foreground">Research Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {new Set(featuredResearch.map((s) => s.country)).size}
              </div>
              <div className="text-sm text-muted-foreground">Countries Represented</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{ongoingStudies.length}</div>
              <div className="text-sm text-muted-foreground">Ongoing Studies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search research, authors, keywords..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="prevalence">Prevalence</SelectItem>
                  <SelectItem value="interventions">Interventions</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="older">Older</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Access</SelectItem>
                  <SelectItem value="open">Open Access</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
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
            <h2 className="text-3xl font-bold mb-4">Research Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore research across key areas of neurodiversity studies in Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {featuredResearch.filter((s) => s.category === category.name).length} studies
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Explore <ChevronRight className="h-4 w-4 ml-1" />
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
          <Tabs defaultValue="published" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-8">
              <TabsTrigger value="published">Published Research</TabsTrigger>
              <TabsTrigger value="ongoing">Ongoing Studies</TabsTrigger>
              <TabsTrigger value="tools">Research Tools</TabsTrigger>
            </TabsList>

            {/* Published Research Tab */}
            <TabsContent value="published" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Featured Research</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Latest peer-reviewed research from African institutions and researchers
                </p>
              </div>

              {featuredResearch.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No published research yet</p>
                  <p className="text-sm">Be the first to submit a study for this research library.</p>
                </div>
              )}

              <div className="space-y-6">
                {featuredResearch.map((study) => (
                  <Card key={study.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline">{study.category}</Badge>
                            <Badge variant="secondary">{study.type}</Badge>
                            {study.openAccess && (
                              <Badge variant="default" className="bg-green-500">
                                Open Access
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{study.year}</div>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                            {study.title}
                          </h3>
                          <div className="text-sm text-muted-foreground mb-2">
                            {study.authors.join(", ")} • {study.institution}
                          </div>
                          <div className="text-sm font-medium text-secondary mb-3">
                            {study.journal} • {study.pages} pages
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{study.abstract}</p>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {study.keywords.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Citations</div>
                            <div className="font-medium">{study.citations}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Downloads</div>
                            <div className="font-medium">{study.downloads.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Country</div>
                            <div className="font-medium">{study.country}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Language</div>
                            <div className="font-medium">{study.language}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-xs text-muted-foreground">DOI: {study.doi}</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" aria-label="Save this study">
                              <Heart className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button size="sm" variant="ghost" aria-label="Share this study">
                              <Share2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                              View
                            </Button>
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Ongoing Studies Tab */}
            <TabsContent value="ongoing" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Ongoing Research Studies</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Current research projects seeking participants or collaboration
                </p>
              </div>

              {ongoingStudies.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No ongoing studies listed yet</p>
                  <p className="text-sm">Researchers can submit active studies seeking participants or collaborators.</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {ongoingStudies.map((study) => (
                  <Card key={study.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant={study.status === "recruiting" ? "default" : "secondary"}
                          className={study.status === "recruiting" ? "bg-green-500" : ""}
                        >
                          {study.status === "recruiting" ? "Recruiting" : "Active"}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {study.title}
                      </CardTitle>
                      <CardDescription>{study.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Lead Institution</div>
                            <div className="font-medium">{study.leadInstitution}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Funding</div>
                            <div className="font-medium">{study.funding}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Countries</div>
                            <div className="font-medium">{study.countries}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Participants</div>
                            <div className="font-medium">{study.participants.toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Start Date</div>
                            <div className="font-medium">{study.startDate}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Expected Completion</div>
                            <div className="font-medium">{study.expectedCompletion}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            Learn More
                          </Button>
                          {study.status === "recruiting" && <Button size="sm">Participate</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Research Tools Tab */}
            <TabsContent value="tools" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Research Tools & Resources</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Validated tools and frameworks for neurodiversity research in African contexts
                </p>
              </div>

              {researchTools.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No research tools listed yet</p>
                  <p className="text-sm">Validated assessment tools and frameworks will appear here as they&apos;re added.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {researchTools.map((tool) => (
                  <Card key={tool.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <Badge variant="outline" className="w-fit">
                        {tool.type}
                      </Badge>
                      <CardTitle className="group-hover:text-primary transition-colors">{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Languages</div>
                          <div className="flex flex-wrap gap-1">
                            {tool.languages.map((lang) => (
                              <Badge key={lang} variant="secondary" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="text-muted-foreground">Validation</div>
                          <div className="font-medium">{tool.validation}</div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Download className="h-4 w-4" />
                            {tool.downloads.toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            {tool.openAccess && (
                              <Badge variant="default" className="bg-green-500 text-xs">
                                Free
                              </Badge>
                            )}
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">
            Contribute to Neurodiversity Research in Africa
          </h2>
          <p className="text-xl opacity-90 text-pretty mb-8 max-w-2xl mx-auto">
            Share your research, collaborate with peers, and help build the evidence base for neurodiversity support
            across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Submit Research
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              Join Research Network
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
