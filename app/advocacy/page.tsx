import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Megaphone,
  Users,
  Calendar,
  MapPin,
  ExternalLink,
  Download,
  Share2,
  Heart,
  CheckCircle,
  Clock,
  Target,
  Briefcase,
  GraduationCap,
  Home,
  Building,
} from "lucide-react"

// No fabricated campaigns, legislative claims, events, or resources below --
// this page shows honest empty states until real advocacy activity exists.
// (A prior version invented specific "passed" legislation in real countries,
// which is a misinformation risk for an advocacy org, not just a cosmetic gap.)
const activeCampaigns: Array<{
  id: number
  title: string
  description: string
  country: string
  status: string
  progress: number
  supporters: number
  target: number
  deadline: string
  category: string
  impact: string
  organizer: string
  updates: number
  actions: string[]
}> = []

const policyAreas = [
  {
    id: "education",
    name: "Education",
    description: "Inclusive education policies and support systems",
    icon: GraduationCap,
    color: "bg-primary/10 text-primary",
    keyIssues: ["Inclusive Classrooms", "Teacher Training", "Assessment Accommodations", "Early Intervention"],
  },
  {
    id: "employment",
    name: "Employment",
    description: "Workplace rights and accommodation policies",
    icon: Briefcase,
    color: "bg-secondary/10 text-secondary",
    keyIssues: ["Reasonable Accommodations", "Anti-Discrimination", "Hiring Practices", "Career Development"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Access to diagnosis, treatment, and support services",
    icon: Heart,
    color: "bg-accent/10 text-accent",
    keyIssues: ["Early Diagnosis", "Affordable Treatment", "Professional Training", "Service Availability"],
  },
  {
    id: "housing",
    name: "Housing",
    description: "Accessible and supportive housing policies",
    icon: Home,
    color: "bg-green-100 text-green-700",
    keyIssues: ["Accessible Design", "Support Services", "Fair Housing", "Community Integration"],
  },
  {
    id: "public-services",
    name: "Public Services",
    description: "Accessible government and public services",
    icon: Building,
    color: "bg-purple-100 text-purple-700",
    keyIssues: ["Service Accessibility", "Staff Training", "Communication Support", "Digital Inclusion"],
  },
]

const successStories: Array<{
  id: number
  title: string
  description: string
  country: string
  date: string
  impact: string
  category: string
  supporters: number
}> = []

const upcomingEvents: Array<{
  id: number
  title: string
  date: string
  location: string
  type: string
  attendees: number
  description: string
}> = []

const advocacyResources: Array<{
  id: number
  title: string
  description: string
  type: string
  pages: number
  downloads: number
  category: string
}> = []

export default function AdvocacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Policy & Advocacy
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Driving <span className="text-primary">Policy Change</span> Across Africa
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Join our advocacy efforts to create inclusive policies and legislation that protect and empower
              neurodivergent individuals across all 54 African countries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" disabled title="Coming soon">
                Start Your Own Campaign
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{activeCampaigns.length}</div>
              <div className="text-sm text-muted-foreground">Active Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">54</div>
              <div className="text-sm text-muted-foreground">Countries Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {activeCampaigns.reduce((sum, c) => sum + c.supporters, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Supporters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{successStories.length}</div>
              <div className="text-sm text-muted-foreground">Policy Wins</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="policy-areas">Policy Areas</TabsTrigger>
              <TabsTrigger value="success">Success Stories</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            {/* Active Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Active Campaigns</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join ongoing advocacy efforts across Africa to create meaningful policy change
                </p>
              </div>

              {activeCampaigns.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Megaphone className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No active campaigns yet</p>
                  <p className="text-sm">Start the first advocacy campaign for your community.</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-2">
                          <Badge variant="outline">{campaign.category}</Badge>
                          <Badge variant="secondary">{campaign.country}</Badge>
                          <Badge
                            variant={campaign.status === "active" ? "default" : "secondary"}
                            className={campaign.status === "active" ? "bg-green-500" : ""}
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {campaign.title}
                      </CardTitle>
                      <CardDescription>{campaign.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>
                              {campaign.supporters.toLocaleString()} / {campaign.target.toLocaleString()} supporters
                            </span>
                          </div>
                          <Progress value={campaign.progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Deadline</div>
                            <div className="font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {campaign.deadline}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Impact</div>
                            <div className="font-medium">{campaign.impact}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Organizer</div>
                          <div className="font-medium">{campaign.organizer}</div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {campaign.actions.map((action) => (
                            <Button key={action} size="sm" variant="outline" className="text-xs bg-transparent">
                              {action}
                            </Button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-muted-foreground">{campaign.updates} updates</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" aria-label="Share campaign">
                              <Share2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button size="sm">Join Campaign</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Policy Areas Tab */}
            <TabsContent value="policy-areas" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Policy Focus Areas</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Key areas where we&apos;re working to create systemic change
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policyAreas.map((area) => (
                  <Card key={area.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${area.color}`}>
                        <area.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">{area.name}</CardTitle>
                      <CardDescription>{area.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm">
                          <div className="font-medium">
                            {activeCampaigns.filter((c) => c.category === area.name).length}
                          </div>
                          <div className="text-muted-foreground">Active Campaigns</div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Key Issues:</h4>
                          <div className="flex flex-wrap gap-1">
                            {area.keyIssues.map((issue) => (
                              <Badge key={issue} variant="secondary" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                          disabled
                          title="No campaigns in this area yet"
                        >
                          View Campaigns
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Success Stories Tab */}
            <TabsContent value="success" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Policy Victories</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Celebrating successful advocacy efforts that have created real change
                </p>
              </div>

              {successStories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No policy wins recorded yet</p>
                  <p className="text-sm">Verified advocacy victories will be celebrated here.</p>
                </div>
              )}

              <div className="space-y-6">
                {successStories.map((story) => (
                  <Card key={story.id} className="group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                {story.title}
                              </h3>
                              <p className="text-muted-foreground mt-1">{story.description}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div>{story.date}</div>
                              <div>{story.country}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{story.category}</Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Target className="h-4 w-4" />
                              {story.impact}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {story.supporters.toLocaleString()} supporters
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Advocacy Resources</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Tools, templates, and guides to help you become an effective advocate
                </p>
              </div>

              {advocacyResources.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Download className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">No resources published yet</p>
                  <p className="text-sm">Advocacy toolkits and templates will be available here soon.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advocacyResources.map((resource) => (
                  <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{resource.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Download className="h-4 w-4" />
                          {resource.downloads.toLocaleString()}
                        </div>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {resource.type} • {resource.pages} pages
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
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

      {/* Upcoming Events */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us at conferences, workshops, and advocacy events across Africa
            </p>
          </div>

          {upcomingEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No events scheduled yet</p>
              <p className="text-sm">Conferences, workshops, and advocacy events will be announced here.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {event.type}
                  </Badge>
                  <CardTitle className="group-hover:text-primary transition-colors">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {event.attendees} expected attendees
                    </div>
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      Register Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Your Voice Can Change Policy</h2>
          <p className="text-xl opacity-90 text-pretty mb-8 max-w-2xl mx-auto">
            Join advocates working to create inclusive policies across Africa. Every voice matters in the
            fight for neurodiversity rights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" disabled title="Coming soon">
              Start Advocating Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
