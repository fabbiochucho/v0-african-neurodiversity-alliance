import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Smartphone,
  Star,
  Download,
  ExternalLink,
  Search,
  Heart,
  Shield,
  Brain,
  BookOpen,
  Volume2,
  Eye,
  Calendar,
  MessageSquare,
  Target,
} from "lucide-react"

const appCategories = [
  {
    id: "communication",
    name: "Communication",
    description: "Apps to support verbal and non-verbal communication",
    icon: MessageSquare,
    count: 24,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "learning",
    name: "Learning & Education",
    description: "Educational tools and learning support apps",
    icon: BookOpen,
    count: 31,
    color: "bg-secondary/10 text-secondary",
  },
  {
    id: "sensory",
    name: "Sensory Support",
    description: "Tools for sensory processing and regulation",
    icon: Eye,
    count: 18,
    color: "bg-accent/10 text-accent",
  },
  {
    id: "organization",
    name: "Organization & Planning",
    description: "Time management and organizational tools",
    icon: Calendar,
    count: 22,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "social",
    name: "Social Skills",
    description: "Apps to develop social interaction skills",
    icon: Heart,
    count: 15,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "wellness",
    name: "Mental Wellness",
    description: "Mindfulness, relaxation, and emotional regulation",
    icon: Brain,
    count: 19,
    color: "bg-blue-100 text-blue-700",
  },
]

const featuredApps = [
  {
    id: 1,
    name: "Proloquo2Go",
    description: "Symbol-based communication app for non-speaking individuals",
    category: "Communication",
    platform: ["iOS", "Android"],
    price: "$299.99",
    rating: 4.8,
    downloads: "50K+",
    ageRange: "3+",
    languages: ["English", "French", "Arabic"],
    features: ["Offline Mode", "Voice Output", "Customizable"],
    developer: "AssistiveWare",
    icon: "/communication-app-icon.jpg",
    screenshots: ["/app-screenshot-1.png"],
    isVerified: true,
    accessibility: ["Screen Reader", "Switch Control", "Voice Control"],
  },
  {
    id: 2,
    name: "Choiceworks",
    description: "Visual schedule and choice board app for daily routines",
    category: "Organization",
    platform: ["iOS", "Android"],
    price: "$14.99",
    rating: 4.6,
    downloads: "25K+",
    ageRange: "3-12",
    languages: ["English", "French", "Spanish"],
    features: ["Visual Schedules", "Timer", "Rewards System"],
    developer: "Bee Visual",
    icon: "/schedule-app-icon.jpg",
    screenshots: ["/schedule-app-screenshot.jpg"],
    isVerified: true,
    accessibility: ["Large Text", "High Contrast", "Simple Interface"],
  },
  {
    id: 3,
    name: "Sensory App House",
    description: "Collection of sensory-friendly interactive experiences",
    category: "Sensory",
    platform: ["iOS", "Android", "Web"],
    price: "Free",
    rating: 4.7,
    downloads: "100K+",
    ageRange: "All Ages",
    languages: ["English", "French", "Portuguese"],
    features: ["Cause & Effect", "Visual Stimulation", "Sound Control"],
    developer: "Sensory App House",
    icon: "/sensory-app-icon.jpg",
    screenshots: ["/sensory-app-screenshot.jpg"],
    isVerified: true,
    accessibility: ["Switch Access", "Eye Tracking", "Touch Sensitivity"],
  },
  {
    id: 4,
    name: "Social Stories Creator",
    description: "Create personalized social stories and visual supports",
    category: "Social",
    platform: ["iOS", "Android"],
    price: "$9.99",
    rating: 4.5,
    downloads: "15K+",
    ageRange: "3-18",
    languages: ["English", "French", "Arabic", "Swahili"],
    features: ["Photo Integration", "Audio Recording", "Story Templates"],
    developer: "Touch Autism",
    icon: "/social-stories-app-icon.jpg",
    screenshots: ["/social-stories-screenshot.jpg"],
    isVerified: true,
    accessibility: ["Voice Over", "Large Text", "Simple Navigation"],
  },
  {
    id: 5,
    name: "Calm Counter",
    description: "Visual and auditory tools for emotional regulation",
    category: "Wellness",
    platform: ["iOS", "Android"],
    price: "$4.99",
    rating: 4.4,
    downloads: "30K+",
    ageRange: "5+",
    languages: ["English", "French", "Arabic"],
    features: ["Breathing Exercises", "Visual Timers", "Calming Sounds"],
    developer: "Therapy Box",
    icon: "/calm-app-icon.jpg",
    screenshots: ["/calm-app-screenshot.jpg"],
    isVerified: true,
    accessibility: ["Voice Guidance", "Vibration Feedback", "Dark Mode"],
  },
  {
    id: 6,
    name: "ModMath",
    description: "Digital graph paper for students with dysgraphia",
    category: "Learning",
    platform: ["iOS", "Android", "Web"],
    price: "Free",
    rating: 4.3,
    downloads: "40K+",
    ageRange: "6-18",
    languages: ["English", "French", "Spanish"],
    features: ["Graph Paper", "Math Tools", "Export Options"],
    developer: "ModMath",
    icon: "/math-app-icon.png",
    screenshots: ["/math-app-screenshot.jpg"],
    isVerified: true,
    accessibility: ["Zoom Support", "High Contrast", "Keyboard Navigation"],
  },
]

const assistiveTech = [
  {
    id: 1,
    name: "Noise-Cancelling Headphones",
    description: "Reduce sensory overload with high-quality noise cancellation",
    category: "Sensory Support",
    price: "$150-$400",
    rating: 4.7,
    features: ["Active Noise Cancellation", "Comfortable Fit", "Long Battery Life"],
    brands: ["Sony", "Bose", "Audio-Technica"],
    availability: "Available in major African cities",
  },
  {
    id: 2,
    name: "Weighted Blankets",
    description: "Provide deep pressure stimulation for better sleep and calm",
    category: "Sensory Support",
    price: "$50-$150",
    rating: 4.5,
    features: ["Various Weights", "Breathable Fabric", "Machine Washable"],
    brands: ["YnM", "Gravity", "Quility"],
    availability: "Online delivery across Africa",
  },
  {
    id: 3,
    name: "Fidget Tools",
    description: "Tactile tools to help with focus and self-regulation",
    category: "Focus & Attention",
    price: "$5-$30",
    rating: 4.4,
    features: ["Portable", "Quiet Operation", "Durable Materials"],
    brands: ["Thinking Putty", "Fidget Cube", "Tangle"],
    availability: "Local and online retailers",
  },
  {
    id: 4,
    name: "Visual Schedule Boards",
    description: "Physical boards for creating visual schedules and routines",
    category: "Organization",
    price: "$25-$80",
    rating: 4.6,
    features: ["Magnetic", "Customizable", "Portable Options"],
    brands: ["Boardmaker", "Picture Exchange", "Custom Local"],
    availability: "Educational suppliers",
  },
]

export default function AppsToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Curated Collection
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Apps & Tools for <span className="text-primary">Neurodivergent</span> Success
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Discover carefully vetted apps, assistive technologies, and tools designed to support neurodivergent
              individuals in communication, learning, organization, and daily life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Browse Apps
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                View Assistive Tech
              </Button>
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
              <Input placeholder="Search apps, tools, features..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="sensory">Sensory</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="social">Social Skills</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                </SelectContent>
              </Select>
              <Select>
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
              <Select>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
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
            {appCategories.map((category) => (
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
                    <Badge variant="secondary">{category.count} apps</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground"
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
          <Tabs defaultValue="apps" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="apps">Mobile Apps</TabsTrigger>
              <TabsTrigger value="assistive">Assistive Tech</TabsTrigger>
            </TabsList>

            {/* Apps Tab */}
            <TabsContent value="apps" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Featured Apps</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Carefully reviewed and recommended by our community of professionals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredApps.map((app) => (
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
                            {app.isVerified && <Shield className="h-4 w-4 text-primary flex-shrink-0" />}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {app.category}
                          </Badge>
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
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{app.downloads}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {app.platform.map((platform) => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div>Age: {app.ageRange}</div>
                          <div>Languages: {app.languages.slice(0, 2).join(", ")}</div>
                          <div>Developer: {app.developer}</div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {app.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-lg font-bold text-primary">{app.price}</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" aria-label="Save to favorites">
                              <Heart className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Assistive Tech Tab */}
            <TabsContent value="assistive" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Assistive Technology</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Physical tools and devices to support daily living and learning
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assistiveTech.map((tech) => (
                  <Card key={tech.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{tech.category}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{tech.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{tech.name}</CardTitle>
                      <CardDescription>{tech.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-2xl font-bold text-primary">{tech.price}</div>

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

                        <div>
                          <h4 className="font-medium mb-1">Popular Brands:</h4>
                          <p className="text-sm text-muted-foreground">{tech.brands.join(", ")}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-1">Availability:</h4>
                          <p className="text-sm text-muted-foreground">{tech.availability}</p>
                        </div>

                        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                          Find Suppliers
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
              All recommended apps and tools are evaluated for accessibility features
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
                <Volume2 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Audio Features</h3>
              <p className="text-sm text-muted-foreground">Voice output, sound control, audio descriptions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Motor Support</h3>
              <p className="text-sm text-muted-foreground">Switch control, touch sensitivity, gesture alternatives</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="h-6 w-6 text-green-700" />
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
            Submit a request for app reviews or suggest tools that have helped you or your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Request App Review
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              Suggest a Tool
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
