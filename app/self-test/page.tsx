"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { isFederationEnabled, getSiblingAppUrl } from "@/lib/federation/config"
import { Brain, ArrowLeft, ArrowRight, CheckCircle, Shield, ExternalLink } from "lucide-react"

// This is a short, non-clinical teaser only. It is NOT a diagnostic
// instrument and does not classify risk. The real, rigorous multi-domain
// assessment lives on the sibling Neu Rafiki app; when federation is
// configured (see lib/federation/config.ts) we send people there to take
// it. Otherwise we point them at this site's own support directory.
interface TeaserQuestion {
  id: string
  domainLabel: string
  text: string
}

const questions: TeaserQuestion[] = [
  {
    id: "social",
    domainLabel: "Social communication",
    text: "Do you find small talk or reading social cues more tiring than it seems to be for other people?",
  },
  {
    id: "attention",
    domainLabel: "Attention & focus",
    text: "Do you often start tasks with enthusiasm but find it hard to see them through to the end?",
  },
  {
    id: "sensory",
    domainLabel: "Sensory processing",
    text: "Do certain sounds, lights, or textures feel overwhelming in a way that doesn't seem to bother others?",
  },
  {
    id: "learning",
    domainLabel: "Reading & language",
    text: "Does reading or writing take noticeably more time or effort than it seems to for your peers?",
  },
  {
    id: "planning",
    domainLabel: "Planning & organization",
    text: "Do you struggle to plan ahead, stay organized, or switch smoothly between tasks?",
  },
]

const options = [
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
]

export default function SelfTestPage() {
  const [view, setView] = useState<"intro" | "quiz" | "done">("intro")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const federationEnabled = isFederationEnabled()
  const siblingAppUrl = getSiblingAppUrl()

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const startQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setView("quiz")
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      setView("done")
    }
  }

  // Intro view
  if (view === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Quick Neurodivergence Check-In</h1>
              <p className="text-muted-foreground">
                A {questions.length}-question starting point, culturally adapted for African contexts. It takes about
                a minute and is not a diagnosis or clinical screening tool.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Before you start</CardTitle>
                <CardDescription>What this check-in is, and isn&apos;t</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1 text-foreground">Not a diagnosis</p>
                    <p>
                      This is a brief, informal reflection tool, not a clinical or diagnostic instrument. It doesn&apos;t
                      score risk levels or tell you whether you or someone you care for is neurodivergent. Only a
                      qualified professional can do that.
                    </p>
                  </div>
                </div>
                <Button onClick={startQuiz} size="lg" className="w-full">
                  Start the check-in
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Quiz view
  if (view === "quiz") {
    const question = questions[currentQuestion]

    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" onClick={() => setView("intro")}>
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Back
              </Button>
              <Badge variant="secondary">{question.domainLabel}</Badge>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="mb-8">
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit">
                  Question {currentQuestion + 1}
                </Badge>
                <CardTitle className="text-xl leading-relaxed">{question.text}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => handleAnswer(question.id, value)}
                  className="space-y-3"
                >
                  {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                      <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer">
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
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</div>

              <Button onClick={nextQuestion} disabled={!answers[question.id]}>
                {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Privacy & cultural sensitivity</p>
                  <p>
                    Your answers stay in this browser tab and aren&apos;t saved or scored. This check-in is culturally
                    adapted for African contexts and is meant purely as a starting point for reflection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Done view
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Thanks for taking a moment</h1>

          <Card className="mt-8 text-left">
            <CardContent className="pt-6 space-y-4">
              <p className="text-muted-foreground">
                This quick check-in isn&apos;t a diagnosis or a clinical screening tool, and it doesn&apos;t produce a
                risk score. If some of these questions felt familiar, that can simply be worth exploring further with
                a proper, in-depth assessment and a qualified professional.
              </p>

              {federationEnabled && siblingAppUrl ? (
                <div className="p-4 bg-[#3C9C87]/10 border border-[#3C9C87]/30 rounded-lg space-y-3">
                  <p className="font-medium">You might want to explore this further.</p>
                  <p className="text-sm text-muted-foreground">
                    Neu Rafiki offers a complete, in-depth neurodivergence assessment that goes far beyond this quick
                    check-in.
                  </p>
                  <Button asChild className="w-full">
                    <a href={`${siblingAppUrl}/assessment/start`} target="_blank" rel="noopener noreferrer">
                      Take the full assessment on Neu Rafiki
                      <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <p className="font-medium">You might want to explore this further.</p>
                  <p className="text-sm text-muted-foreground">
                    A good next step is connecting with a qualified professional or a local support community who can
                    help you explore what you noticed today.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/directory">Find Support Services</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button variant="outline" onClick={() => setView("intro")}>
              Retake the check-in
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
