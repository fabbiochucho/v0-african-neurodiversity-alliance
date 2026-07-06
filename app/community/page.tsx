import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageCircle,
  Users,
  Heart,
  Pin,
  Clock,
  Search,
  Plus,
  TrendingUp,
  Shield,
  Globe,
  ChevronRight,
  Eye,
  MessageSquare,
  ThumbsUp,
  Flag,
  Star,
} from "lucide-react"

const forumCategories = [
  {
    id: 1,
    name: "General Discussion",
    description: "Open discussions about neurodiversity experiences",
    posts: 1247,
    members: 3420,
    color: "bg-primary/10 text-primary",
    icon: MessageCircle,
    lastActivity: "2 minutes ago",
    moderators: ["Dr. Amina Hassan", "Sarah K."],
  },
  {
    id: 2,
    name: "Parents & Caregivers",
    description: "Support and advice for families",
    posts: 892,
    members: 2156,
    color: "bg-secondary/10 text-secondary",
    icon: Heart,
    lastActivity: "5 minutes ago",
    moderators: ["Maria Santos", "John M."],
  },
  {
    id: 3,
    name: "Educators & Professionals",
    description: "Resources and strategies for professionals",
    posts: 634,
    members: 1789,
    color: "bg-accent/10 text-accent",
    icon: Users,
    lastActivity: "12 minutes ago",
    moderators: ["Prof. Kwame Asante"],
  },
  {
    id: 4,
    name: "Country-Specific Groups",
    description: "Connect with people in your region",
    posts: 445,
    members: 2890,
    color: "bg-green-100 text-green-700",
    icon: Globe,
    lastActivity: "8 minutes ago",
    moderators: ["Regional Coordinators"],
  },
  {
    id: 5,
    name: "Success Stories",
    description: "Share achievements and positive experiences",
    posts: 278,
    members: 1567,
    color: "bg-yellow-100 text-yellow-700",
    icon: Star,
    lastActivity: "1 hour ago",
    moderators: ["Community Team"],
  },
]

const recentPosts = [
  {
    id: 1,
    title: "How do I explain autism to my extended family?",
    author: "Fatima A.",
    avatar: "/serene-african-woman.png",
    category: "Parents & Caregivers",
    replies: 23,
    views: 156,
    likes: 12,
    timeAgo: "2 hours ago",
    isPinned: false,
    tags: ["autism", "family", "communication"],
    country: "Morocco",
  },
  {
    id: 2,
    title: "Inclusive teaching strategies that work in Nigerian classrooms",
    author: "Dr. Chidi Okafor",
    avatar: "/african-teacher.png",
    category: "Educators & Professionals",
    replies: 18,
    views: 234,
    likes: 31,
    timeAgo: "4 hours ago",
    isPinned: true,
    tags: ["education", "strategies", "nigeria"],
    country: "Nigeria",
  },
  {
    id: 3,
    title: "My daughter just got her first job! 🎉",
    author: "Grace M.",
    avatar: "/african-woman-happy.jpg",
    category: "Success Stories",
    replies: 45,
    views: 389,
    likes: 67,
    timeAgo: "6 hours ago",
    isPinned: false,
    tags: ["success", "employment", "autism"],
    country: "Kenya",
  },
  {
    id: 4,
    title: "Looking for ADHD support groups in Cape Town",
    author: "Thabo L.",
    avatar: "/thoughtful-african-man.png",
    category: "Country-Specific Groups",
    replies: 8,
    views: 92,
    likes: 5,
    timeAgo: "8 hours ago",
    isPinned: false,
    tags: ["adhd", "support-groups", "cape-town"],
    country: "South Africa",
  },
  {
    id: 5,
    title: "Sensory-friendly spaces in African schools - let's discuss",
    author: "Dr. Aisha Okonkwo",
    avatar: "/african-woman-professional.jpg",
    category: "Educators & Professionals",
    replies: 29,
    views: 201,
    likes: 24,
    timeAgo: "12 hours ago",
    isPinned: false,
    tags: ["sensory", "schools", "environment"],
    country: "Nigeria",
  },
]

const trendingTopics = [
  { tag: "autism-awareness", posts: 156 },
  { tag: "inclusive-education", posts: 89 },
  { tag: "family-support", posts: 67 },
  { tag: "workplace-inclusion", posts: 45 },
  { tag: "early-intervention", posts: 34 },
]

const communityStats = [
  { label: "Active Members", value: "12,450", icon: Users },
  { label: "Total Posts", value: "3,496", icon: MessageCircle },
  { label: "Countries", value: "54", icon: Globe },
  { label: "Moderators", value: "28", icon: Shield },
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Safe Community Space
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Connect, Share, and <span className="text-primary">Grow Together</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Join thousands of neurodivergent individuals, families, and professionals across Africa in our supportive
              community forums.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                <Plus className="mr-2 h-5 w-5" />
                Start a Discussion
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                Browse Categories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {communityStats.map((stat, index) => (
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
              <Tabs defaultValue="categories" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <TabsList className="grid w-full sm:w-auto grid-cols-2">
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="recent">Recent Posts</TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search discussions..." className="pl-10 sm:w-64" />
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </div>
                </div>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                  {forumCategories.map((category) => (
                    <Card key={category.id} className="group hover:shadow-md transition-all duration-300">
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
                                    {category.posts.toLocaleString()} posts
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {category.members.toLocaleString()} members
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {category.lastActivity}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <div className="text-xs text-muted-foreground">
                                    Moderators: {category.moderators.join(", ")}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Recent Posts Tab */}
                <TabsContent value="recent" className="space-y-4">
                  {recentPosts.map((post) => (
                    <Card key={post.id} className="group hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                            <AvatarFallback>
                              {post.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                                <Badge variant="outline" className="text-xs">
                                  {post.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {post.country}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">{post.timeAgo}</div>
                            </div>

                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                              {post.title}
                            </h3>

                            <div className="flex items-center gap-1 mb-3">
                              <span className="text-sm text-muted-foreground">by</span>
                              <span className="text-sm font-medium">{post.author}</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {post.replies}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.views}
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {post.likes}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" aria-label="Like this post">
                                  <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                                </Button>
                                <Button size="sm" variant="ghost" aria-label="Report this post">
                                  <Flag className="h-4 w-4" aria-hidden="true" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>Be respectful and supportive of all community members</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                    <div>Share experiences and advice constructively</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <div>Respect privacy and confidentiality</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>Report inappropriate content to moderators</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                    Read Full Guidelines
                  </Button>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="text-sm font-medium">#{topic.tag}</div>
                      <Badge variant="secondary" className="text-xs">
                        {topic.posts}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Discussion
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Find Local Groups
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Private Messages
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Heart className="h-4 w-4 mr-2" />
                    My Saved Posts
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
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Your Voice Matters in Our Community</h2>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            Share your experiences, ask questions, and connect with others who understand your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Join the Conversation
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              Learn About Moderation
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
