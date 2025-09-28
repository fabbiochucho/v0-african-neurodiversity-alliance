import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  Users,
  Star,
  Play,
  Briefcase as Certificate,
  Search,
  GraduationCap,
  Award,
  Video,
  FileText,
  Headphones,
} from "lucide-react"

const courses = [
  {
    id: 1,
    title: "Understanding Autism Spectrum Disorders",
    description: "Comprehensive course for parents, caregivers, and educators on autism support strategies.",
    category: "Autism",
    level: "Beginner",
    duration: "6 hours",
    students: 1250,
    rating: 4.8,
    price: "Free",
    instructor: "Dr. Amina Hassan",
    country: "Kenya",
    modules: 8,
    type: "video",
    certification: true,
  },
  {
    id: 2,
    title: "ADHD Management in African Contexts",
    description: "Culturally-informed approaches to supporting children and adults with ADHD.",
    category: "ADHD",
    level: "Intermediate",
    duration: "4 hours",
    students: 890,
    rating: 4.7,
    price: "$29",
    instructor: "Prof. Kwame Asante",
    country: "Ghana",
    modules: 6,
    type: "mixed",
    certification: true,
  },
  {
    id: 3,
    title: "Dyslexia Support Strategies",
    description: "Evidence-based interventions for reading and learning difficulties.",
    category: "Dyslexia",
    level: "Beginner",
    duration: "5 hours",
    students: 670,
    rating: 4.9,
    price: "Free",
    instructor: "Dr. Fatima Al-Rashid",
    country: "Morocco",
    modules: 7,
    type: "video",
    certification: false,
  },
  {
    id: 4,
    title: "Inclusive Classroom Design",
    description: "Creating learning environments that support all neurodivergent learners.",
    category: "Education",
    level: "Advanced",
    duration: "8 hours",
    students: 445,
    rating: 4.6,
    price: "$49",
    instructor: "Dr. Nomsa Mbeki",
    country: "South Africa",
    modules: 10,
    type: "mixed",
    certification: true,
  },
  {
    id: 5,
    title: "Sensory Processing Fundamentals",
    description: "Understanding and supporting sensory processing differences.",
    category: "Sensory",
    level: "Beginner",
    duration: "3 hours",
    students: 780,
    rating: 4.5,
    price: "Free",
    instructor: "Dr. Aisha Okonkwo",
    country: "Nigeria",
    modules: 5,
    type: "audio",
    certification: false,
  },
  {
    id: 6,
    title: "Family Support Systems",
    description: "Building resilient support networks for neurodivergent families.",
    category: "Family",
    level: "Intermediate",
    duration: "6 hours",
    students: 920,
    rating: 4.8,
    price: "$19",
    instructor: "Dr. Zara Tadesse",
    country: "Ethiopia",
    modules: 8,
    type: "mixed",
    certification: true,
  },
]

const certifications = [
  {
    id: 1,
    title: "Certified Neurodiversity Advocate",
    description: "Comprehensive certification program for advocacy and support professionals.",
    duration: "40 hours",
    modules: 12,
    price: "$199",
    level: "Professional",
    recognition: "ANDA Certified",
  },
  {
    id: 2,
    title: "Inclusive Education Specialist",
    description: "Advanced certification for educators working with neurodivergent learners.",
    duration: "60 hours",
    modules: 15,
    price: "$299",
    level: "Advanced",
    recognition: "ANDA Certified",
  },
  {
    id: 3,
    title: "Family Support Coordinator",
    description: "Training program for professionals supporting neurodivergent families.",
    duration: "30 hours",
    modules: 10,
    price: "$149",
    level: "Intermediate",
    recognition: "ANDA Certified",
  },
]

const webinars = [
  {
    id: 1,
    title: "Neurodiversity in the African Workplace",
    date: "March 15, 2025",
    time: "14:00 GMT",
    speaker: "Dr. Kofi Mensah",
    attendees: 450,
    status: "upcoming",
  },
  {
    id: 2,
    title: "Early Intervention Strategies",
    date: "March 22, 2025",
    time: "16:00 GMT",
    speaker: "Dr. Lila Ouma",
    attendees: 320,
    status: "upcoming",
  },
  {
    id: 3,
    title: "Building Inclusive Communities",
    date: "February 28, 2025",
    time: "15:00 GMT",
    speaker: "Prof. Amara Diallo",
    attendees: 680,
    status: "completed",
  },
]

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Professional Development
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Learn, Grow, and <span className="text-primary">Empower</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Access world-class courses, certifications, and resources designed specifically for supporting
              neurodivergent individuals across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Browse Courses
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                View Certifications
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
              <Input placeholder="Search courses, topics, instructors..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="autism">Autism</SelectItem>
                  <SelectItem value="adhd">ADHD</SelectItem>
                  <SelectItem value="dyslexia">Dyslexia</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
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

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="webinars">Webinars</TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Expert-led courses designed by African professionals for African contexts
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{course.category}</Badge>
                        <div className="flex items-center gap-1">
                          {course.type === "video" && <Video className="h-4 w-4 text-muted-foreground" />}
                          {course.type === "audio" && <Headphones className="h-4 w-4 text-muted-foreground" />}
                          {course.type === "mixed" && <FileText className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.students.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{course.rating}</span>
                          </div>
                          <Badge variant="secondary">{course.level}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{course.instructor}</div>
                            <div className="text-xs text-muted-foreground">{course.country}</div>
                          </div>
                          {course.certification && (
                            <Certificate className="h-4 w-4 text-primary" title="Certification Available" />
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-lg font-bold text-primary">{course.price}</div>
                          <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                            Enroll Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Professional Certifications</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Advance your career with internationally recognized certifications
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.map((cert) => (
                  <Card key={cert.id} className="group hover:shadow-lg transition-all duration-300 border-2">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <Badge variant="outline">{cert.recognition}</Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{cert.title}</CardTitle>
                      <CardDescription>{cert.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="font-medium">{cert.duration}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Modules</div>
                            <div className="font-medium">{cert.modules}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{cert.level}</Badge>
                          <Award className="h-5 w-5 text-accent" />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-2xl font-bold text-primary">{cert.price}</div>
                          <Button className="group-hover:bg-primary group-hover:text-primary-foreground">
                            Start Program
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Webinars Tab */}
            <TabsContent value="webinars" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Live Webinars & Events</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join live sessions with experts and connect with the community
                </p>
              </div>

              <div className="space-y-4">
                {webinars.map((webinar) => (
                  <Card key={webinar.id} className="group hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={webinar.status === "upcoming" ? "default" : "secondary"}>
                              {webinar.status === "upcoming" ? "Upcoming" : "Completed"}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {webinar.date} • {webinar.time}
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {webinar.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div>Speaker: {webinar.speaker}</div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {webinar.attendees} registered
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {webinar.status === "upcoming" ? (
                            <Button>Register Free</Button>
                          ) : (
                            <Button variant="outline">
                              <Play className="h-4 w-4 mr-2" />
                              Watch Recording
                            </Button>
                          )}
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
            Become a Certified Neurodiversity Professional
          </h2>
          <p className="text-xl opacity-90 text-pretty mb-8 max-w-2xl mx-auto">
            Join thousands of professionals across Africa who are making a difference in neurodivergent lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              View All Certifications
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              Contact Admissions
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
