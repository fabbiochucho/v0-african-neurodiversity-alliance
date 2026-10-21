import { Navigation } from "@/components/navigation"
import { t, type MessageKey } from "@/lib/i18n"
import { getSiteLanguage } from "@/lib/i18n/server"
import { ANDA_CONTACT_EMAIL, contactHref } from "@/lib/legal"
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
    color: "bg-terracotta/10 text-terracotta",
    keyIssues: ["Reasonable Accommodations", "Anti-Discrimination", "Hiring Practices", "Career Development"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Access to diagnosis, treatment, and support services",
    icon: Heart,
    color: "bg-terracotta/10 text-terracotta",
    keyIssues: ["Early Diagnosis", "Affordable Treatment", "Professional Training", "Service Availability"],
  },
  {
    id: "housing",
    name: "Housing",
    description: "Accessible and supportive housing policies",
    icon: Home,
    color: "bg-primary/10 text-primary",
    keyIssues: ["Accessible Design", "Support Services", "Fair Housing", "Community Integration"],
  },
  {
    id: "public-services",
    name: "Public Services",
    description: "Accessible government and public services",
    icon: Building,
    color: "bg-secondary text-secondary-foreground",
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

const CAMPAIGN_TEMPLATE = `Campaign idea:
Country or region:
Who it would help:
What change you want (policy, school, service):
How ANDA could help:
`

export default async function AdvocacyPage() {
  const lang = await getSiteLanguage()
  const tr = (key: MessageKey, vars?: Record<string, string | number>) => t(key, vars, lang)
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-terracotta/5 to-terracotta/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              {tr("adv.badge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              {tr("adv.heroA")} <span className="text-primary">{tr("adv.heroB")}</span> {tr("adv.heroC")}
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              {tr("adv.heroText")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
                <a href={contactHref("Campaign proposal", CAMPAIGN_TEMPLATE)}>{tr("adv.startCampaign")}</a>
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
              <div className="text-sm text-muted-foreground">{tr("adv.activeCampaigns")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-terracotta">54</div>
              <div className="text-sm text-muted-foreground">{tr("adv.countries")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-terracotta">
                {activeCampaigns.reduce((sum, c) => sum + c.supporters, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">{tr("adv.supporters")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{successStories.length}</div>
              <div className="text-sm text-muted-foreground">{tr("adv.policyWins")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
              <TabsTrigger value="campaigns">{tr("adv.tabCampaigns")}</TabsTrigger>
              <TabsTrigger value="policy-areas">{tr("adv.tabPolicyAreas")}</TabsTrigger>
              <TabsTrigger value="success">{tr("adv.tabSuccess")}</TabsTrigger>
              <TabsTrigger value="resources">{tr("adv.tabResources")}</TabsTrigger>
            </TabsList>

            {/* Active Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">{tr("adv.activeCampaigns")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {tr("adv.campaignsText")}
                </p>
              </div>

              {activeCampaigns.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Megaphone className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">{tr("adv.noCampaigns")}</p>
                  <p className="text-sm">{tr("adv.noCampaignsText")}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="group transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-2">
                          <Badge variant="outline">{campaign.category}</Badge>
                          <Badge variant="secondary">{campaign.country}</Badge>
                          <Badge
                            variant={campaign.status === "active" ? "default" : "secondary"}
                            className={campaign.status === "active" ? "bg-primary" : ""}
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
                <h2 className="text-3xl font-bold mb-4">{tr("adv.policyFocus")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {tr("adv.policyText")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policyAreas.map((area) => (
                  <Card key={area.id} className="group transition-colors">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${area.color}`}>
                        <area.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">{tr(`adv.area.${area.id}` as MessageKey)}</CardTitle>
                      <CardDescription>{tr(`adv.area.${area.id}.text` as MessageKey)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm">
                          <div className="font-medium">
                            {activeCampaigns.filter((c) => c.category === area.name).length}
                          </div>
                          <div className="text-muted-foreground">{tr("adv.activeCampaigns")}</div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">{tr("adv.keyIssues")}</h4>
                          <div className="flex flex-wrap gap-1">
                            {area.keyIssues.map((issue, i) => (
                              <Badge key={issue} variant="secondary" className="text-xs">
                                {tr(`adv.area.${area.id}.issue${i}` as MessageKey)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                          disabled
                          title={tr("adv.noAreaCampaigns")}
                        >
                          {tr("adv.viewCampaigns")}
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
                <h2 className="text-3xl font-bold mb-4">{tr("adv.victories")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {tr("adv.victoriesText")}
                </p>
              </div>

              {successStories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">{tr("adv.noWins")}</p>
                  <p className="text-sm">{tr("adv.noWinsText")}</p>
                </div>
              )}

              <div className="space-y-6">
                {successStories.map((story) => (
                  <Card key={story.id} className="group transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-6 w-6 text-primary" />
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
                <h2 className="text-3xl font-bold mb-4">{tr("adv.resourcesTitle")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {tr("adv.resourcesText")}
                </p>
              </div>

              {advocacyResources.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Download className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-1">{tr("adv.noResources")}</p>
                  <p className="text-sm">{tr("adv.noResourcesText")}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advocacyResources.map((resource) => (
                  <Card key={resource.id} className="group transition-colors">
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
            <h2 className="text-3xl font-bold mb-4">{tr("adv.events")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {tr("adv.eventsText")}
            </p>
          </div>

          {upcomingEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">{tr("adv.noEvents")}</p>
              <p className="text-sm">{tr("adv.noEventsText")}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="group transition-colors">
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
      <section className="py-20 bg-gradient-to-r from-primary to-terracotta text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">{tr("adv.ctaTitle")}</h2>
          <p className="text-xl opacity-90 text-pretty mb-8 max-w-2xl mx-auto">
            {tr("adv.ctaText")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <a href={contactHref("I want to advocate with ANDA", `Where I am:
How I'd like to help:
`)}>{tr("adv.ctaButton")}</a>
            </Button>
          </div>
          <p className="mt-4 text-sm opacity-90">{tr("adv.emailNote", { email: ANDA_CONTACT_EMAIL })}</p>
        </div>
      </section>
    </div>
  )
}
