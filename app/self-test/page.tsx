"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Users,
  User,
  UserPlus,
  Settings,
  Download,
  Calendar,
  TrendingUp,
  Globe,
  Shield,
  Loader,
} from "lucide-react"

interface Domain {
  id: string
  name: string
  description: string
  ageGroups: string[]
  color: string
}

interface Question {
  id: string
  text: string
  domain: string
  ageGroup: string
  category: "baseline" | "followup"
  options: { value: string; label: string; score: number }[]
  culturalContext?: string[]
}

interface UserProfile {
  id: string
  name: string
  ageGroup: string
  selectedDomains: string[]
  screeningType: "selective" | "full"
  culturalContext: string
  language: string
}

interface AssessmentSession {
  profileId: string
  domain: string
  startDate: Date
  answers: Record<string, string>
  completed: boolean
  scores: Record<string, number>
}

const domains: Domain[] = [
  {
    id: "asd",
    name: "Autism Spectrum Disorder (ASD)",
    description: "Social communication, interaction patterns, and repetitive behaviors",
    ageGroups: ["Children 0–12", "Teens 13–17", "Adults 18+"],
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "adhd",
    name: "ADHD",
    description: "Attention, hyperactivity, and impulse control patterns",
    ageGroups: ["Children 0–12", "Teens 13–17", "Adults 18+"],
    color: "bg-green-100 text-green-800",
  },
  {
    id: "dyslexia",
    name: "Dyslexia / Learning Differences",
    description: "Reading, writing, and language processing patterns",
    ageGroups: ["Children 0–12", "Teens 13–17", "Adults 18+"],
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "dyspraxia",
    name: "Dyspraxia / Motor Coordination",
    description: "Motor planning, coordination, and movement patterns",
    ageGroups: ["Children 0–12", "Teens 13–17", "Adults 18+"],
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "sensory",
    name: "Sensory Processing",
    description: "Sensory integration and processing patterns",
    ageGroups: ["Children 0–12", "Teens 13–17", "Adults 18+"],
    color: "bg-teal-100 text-teal-800",
  },
  {
    id: "executive",
    name: "Cognitive & Executive Function",
    description: "Planning, organization, and cognitive flexibility",
    ageGroups: ["Children 0–12", "Teens 13–17", "Adults 18+"],
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "functional",
    name: "Multi-Informant Functional Assessment",
    description: "Daily living skills and functional abilities",
    ageGroups: ["Children 0–12", "Teens 13–17", "Adults 18+"],
    color: "bg-pink-100 text-pink-800",
  },
]

const questionBank: Question[] = [
  // ASD Questions - Children
  {
    id: "asd_child_1",
    text: "Does the child have difficulty making eye contact during conversations?",
    domain: "asd",
    ageGroup: "Children 0–12",
    category: "baseline",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
    culturalContext: ["Consider cultural norms around eye contact in different African communities"],
  },
  {
    id: "asd_child_2",
    text: "Does the child prefer to play alone rather than with other children?",
    domain: "asd",
    ageGroup: "Children 0–12",
    category: "baseline",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
  },
  // ASD Questions - Teens
  {
    id: "asd_teen_1",
    text: "Do you find it difficult to understand social cues and non-verbal communication?",
    domain: "asd",
    ageGroup: "Teens 13–17",
    category: "baseline",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
  },
  // ASD Questions - Adults
  {
    id: "asd_adult_1",
    text: "I find it challenging to maintain friendships and social relationships",
    domain: "asd",
    ageGroup: "Adults 18+",
    category: "baseline",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
  },
  // ADHD Questions
  {
    id: "adhd_child_1",
    text: "Does the child have difficulty sitting still during meals or school activities?",
    domain: "adhd",
    ageGroup: "Children 0–12",
    category: "baseline",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
  },
  {
    id: "adhd_teen_1",
    text: "Do you have difficulty maintaining focus on schoolwork or tasks?",
    domain: "adhd",
    ageGroup: "Teens 13–17",
    category: "baseline",
    options: [
      { value: "never", label: "Never", score: 0 },
      { value: "rarely", label: "Rarely", score: 1 },
      { value: "sometimes", label: "Sometimes", score: 2 },
      { value: "often", label: "Often", score: 3 },
      { value: "always", label: "Always", score: 4 },
    ],
  },
  // Additional domains would have similar comprehensive question sets...
]

export default function SelfTestPage() {
  const [currentView, setCurrentView] = useState<"setup" | "assessment" | "results" | "dashboard">("setup")
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null)
  const [currentDomain, setCurrentDomain] = useState<string>("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [sessions, setSessions] = useState<AssessmentSession[]>([])
  const [isPremium, setIsPremium] = useState(false)

  const [newProfile, setNewProfile] = useState({
    name: "",
    ageGroup: "",
    selectedDomains: [] as string[],
    screeningType: "selective" as "selective" | "full",
    culturalContext: "",
    language: "English",
  })

  const filteredQuestions = questionBank.filter(
    (q) => q.domain === currentDomain && q.ageGroup === currentProfile?.ageGroup && q.category === "baseline",
  )

  const progress = filteredQuestions.length > 0 ? ((currentQuestion + 1) / filteredQuestions.length) * 100 : 0

  const createProfile = () => {
    if (!newProfile.name || !newProfile.ageGroup || newProfile.selectedDomains.length === 0) return

    const profile: UserProfile = {
      id: Date.now().toString(),
      ...newProfile,
    }

    setProfiles([...profiles, profile])
    setCurrentProfile(profile)
    setCurrentView("dashboard")

    // Reset form
    setNewProfile({
      name: "",
      ageGroup: "",
      selectedDomains: [],
      screeningType: "selective",
      culturalContext: "",
      language: "English",
    })
  }

  const startAssessment = (domainId: string) => {
    setCurrentDomain(domainId)
    setCurrentQuestion(0)
    setAnswers({})
    setCurrentView("assessment")
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const nextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      completeAssessment()
    }
  }

  const completeAssessment = () => {
    if (!currentProfile) return

    const scores = calculateDomainScores()
    const session: AssessmentSession = {
      profileId: currentProfile.id,
      domain: currentDomain,
      startDate: new Date(),
      answers,
      completed: true,
      scores,
    }

    setSessions([...sessions, session])
    setCurrentView("results")
  }

  const calculateDomainScores = () => {
    const scores: Record<string, number> = {}

    filteredQuestions.forEach((question) => {
      const answer = answers[question.id]
      if (answer) {
        const option = question.options.find((opt) => opt.value === answer)
        if (option) {
          scores[question.domain] = (scores[question.domain] || 0) + option.score
        }
      }
    })

    return scores
  }

  // Setup View
  if (currentView === "setup") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">ANDA Neurodivergent Self-Test</h1>
              <p className="text-muted-foreground">
                Comprehensive multi-domain assessment with cultural adaptation for African contexts
              </p>
            </div>

            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create New Profile</TabsTrigger>
                <TabsTrigger value="existing">Existing Profiles ({profiles.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Create Assessment Profile
                    </CardTitle>
                    <CardDescription>
                      Set up a personalized assessment profile with cultural and linguistic preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Profile Name</Label>
                        <Input
                          id="name"
                          value={newProfile.name}
                          onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                          placeholder="Enter name or identifier"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ageGroup">Age Group</Label>
                        <Select
                          value={newProfile.ageGroup}
                          onValueChange={(value) => setNewProfile({ ...newProfile, ageGroup: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select age group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Children 0–12">Children (0-12 years)</SelectItem>
                            <SelectItem value="Teens 13–17">Teens (13-17 years)</SelectItem>
                            <SelectItem value="Adults 18+">Adults (18+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Assessment Domains</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select the areas you'd like to assess</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {domains.map((domain) => (
                          <div key={domain.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={domain.id}
                              checked={newProfile.selectedDomains.includes(domain.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewProfile({
                                    ...newProfile,
                                    selectedDomains: [...newProfile.selectedDomains, domain.id],
                                  })
                                } else {
                                  setNewProfile({
                                    ...newProfile,
                                    selectedDomains: newProfile.selectedDomains.filter((id) => id !== domain.id),
                                  })
                                }
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor={domain.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {domain.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">{domain.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="culturalContext">Cultural Context</Label>
                        <Select
                          value={newProfile.culturalContext}
                          onValueChange={(value) => setNewProfile({ ...newProfile, culturalContext: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select cultural context" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="west-africa">West Africa</SelectItem>
                            <SelectItem value="east-africa">East Africa</SelectItem>
                            <SelectItem value="southern-africa">Southern Africa</SelectItem>
                            <SelectItem value="central-africa">Central Africa</SelectItem>
                            <SelectItem value="north-africa">North Africa</SelectItem>
                            <SelectItem value="diaspora">African Diaspora</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="language">Preferred Language</Label>
                        <Select
                          value={newProfile.language}
                          onValueChange={(value) => setNewProfile({ ...newProfile, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="Arabic">Arabic</SelectItem>
                            <SelectItem value="Swahili">Swahili</SelectItem>
                            <SelectItem value="Portuguese">Portuguese</SelectItem>
                            <SelectItem value="Amharic">Amharic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Screening Type</Label>
                      <RadioGroup
                        value={newProfile.screeningType}
                        onValueChange={(value: "selective" | "full") =>
                          setNewProfile({ ...newProfile, screeningType: value })
                        }
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="selective" id="selective" />
                          <Label htmlFor="selective">Selective Screening (Selected domains only)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="full" id="full" />
                          <Label htmlFor="full">Full Comprehensive Screening (All domains)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button onClick={createProfile} className="w-full" size="lg">
                      Create Profile & Continue
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="existing">
                {profiles.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Profiles Yet</h3>
                      <p className="text-muted-foreground mb-4">Create your first assessment profile to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {profiles.map((profile) => (
                      <Card key={profile.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{profile.name}</h3>
                              <p className="text-sm text-muted-foreground">{profile.ageGroup}</p>
                              <div className="flex gap-2 mt-2">
                                {profile.selectedDomains.slice(0, 3).map((domainId) => {
                                  const domain = domains.find((d) => d.id === domainId)
                                  return domain ? (
                                    <Badge key={domainId} variant="secondary" className="text-xs">
                                      {domain.name.split(" ")[0]}
                                    </Badge>
                                  ) : null
                                })}
                                {profile.selectedDomains.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{profile.selectedDomains.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                setCurrentProfile(profile)
                                setCurrentView("dashboard")
                              }}
                            >
                              Select Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard View
  if (currentView === "dashboard" && currentProfile) {
    const profileSessions = sessions.filter((s) => s.profileId === currentProfile.id)
    const completedDomains = profileSessions.map((s) => s.domain)
    const pendingDomains = currentProfile.selectedDomains.filter((d) => !completedDomains.includes(d))

    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Assessment Dashboard</h1>
                <p className="text-muted-foreground">
                  Profile: {currentProfile.name} ({currentProfile.ageGroup})
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentView("setup")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Profiles
                </Button>
                {isPremium && (
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Reports
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Domains Assessed</p>
                      <p className="text-2xl font-bold">{completedDomains.length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Assessments</p>
                      <p className="text-2xl font-bold">{pendingDomains.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold">
                        {Math.round((completedDomains.length / currentProfile.selectedDomains.length) * 100)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {pendingDomains.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Available Assessments</CardTitle>
                  <CardDescription>Start or continue your domain assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingDomains.map((domainId) => {
                      const domain = domains.find((d) => d.id === domainId)
                      if (!domain) return null

                      return (
                        <Card key={domainId} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <Badge className={domain.color}>{domain.name}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{domain.description}</p>
                            <Button onClick={() => startAssessment(domainId)} className="w-full" size="sm">
                              Start Assessment
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {profileSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed Assessments</CardTitle>
                  <CardDescription>View your assessment history and results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileSessions.map((session, index) => {
                      const domain = domains.find((d) => d.id === session.domain)
                      if (!domain) return null

                      return (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Badge className={domain.color}>{domain.name}</Badge>
                            <div>
                              <p className="font-medium">Assessment Completed</p>
                              <p className="text-sm text-muted-foreground">{session.startDate.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View Results
                            </Button>
                            {isPremium && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Assessment View
  if (currentView === "assessment" && filteredQuestions.length > 0) {
    const currentQ = filteredQuestions[currentQuestion]
    const domain = domains.find((d) => d.id === currentDomain)

    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setCurrentView("dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              {domain && <Badge className={domain.color}>{domain.name}</Badge>}
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion + 1} of {filteredQuestions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="mb-2">
                    Question {currentQuestion + 1}
                  </Badge>
                  <Badge variant="secondary">{currentProfile?.ageGroup}</Badge>
                </div>
                <CardTitle className="text-xl leading-relaxed">{currentQ.text}</CardTitle>
                {currentQ.culturalContext && (
                  <CardDescription className="flex items-start gap-2">
                    <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{currentQ.culturalContext[0]}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(value) => handleAnswer(currentQ.id, value)}
                  className="space-y-3"
                >
                  {currentQ.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</div>

              <Button onClick={nextQuestion} disabled={!answers[currentQ.id]}>
                {currentQuestion === filteredQuestions.length - 1 ? "Complete Assessment" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Privacy & Cultural Sensitivity</p>
                  <p>
                    This assessment is culturally adapted for African contexts and maintains strict confidentiality.
                    Results are for informational purposes and should be discussed with qualified professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results View
  if (currentView === "results") {
    const scores = calculateDomainScores()
    const domain = domains.find((d) => d.id === currentDomain)

    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Assessment Complete</h1>
              <p className="text-muted-foreground">
                {domain?.name} assessment for {currentProfile?.name}
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Domain Results: {domain?.name}
                </CardTitle>
                <CardDescription>
                  Culturally adapted assessment results with African context considerations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPremium ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-primary/5 rounded-lg">
                      <h3 className="font-semibold mb-4">Detailed Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(scores).map(([domainKey, score]) => (
                          <div key={domainKey} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium capitalize">{domainKey}</h4>
                              <Badge variant={score > 12 ? "destructive" : score > 8 ? "default" : "secondary"}>
                                {score > 12 ? "High" : score > 8 ? "Moderate" : "Low"}
                              </Badge>
                            </div>
                            <Progress value={(score / 20) * 100} className="h-2 mb-2" />
                            <p className="text-sm text-muted-foreground">Score: {score}/20</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Culturally-Informed Recommendations</h3>
                      <div className="grid gap-4">
                        <div className="flex items-start gap-3 p-4 border rounded-lg">
                          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">Professional Consultation</h4>
                            <p className="text-sm text-muted-foreground">
                              Consider discussing these results with a culturally competent healthcare professional
                              familiar with African contexts.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 border rounded-lg">
                          <Users className="h-5 w-5 text-secondary mt-0.5" />
                          <div>
                            <h4 className="font-medium">Community Support</h4>
                            <p className="text-sm text-muted-foreground">
                              Connect with local support groups and community resources through our directory.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-6 bg-muted/50 rounded-lg mb-6">
                      <h3 className="font-semibold mb-2">Basic Assessment Complete</h3>
                      <p className="text-muted-foreground mb-4">
                        Your {domain?.name} assessment has been completed. Upgrade to Premium for detailed analysis,
                        cultural recommendations, and longitudinal tracking.
                      </p>
                      <Button size="lg" className="mb-4">
                        Upgrade to Premium - $15/month
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
              <Button onClick={() => setCurrentView("dashboard")}>Return to Dashboard</Button>
              <Button variant="outline" asChild>
                <Link href="/directory">Find Support Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
