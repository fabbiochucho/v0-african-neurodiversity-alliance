"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader } from "lucide-react"

interface Question {
  id: string
  domain: string
  question_text: string
  question_order: number
  assessment_options: Array<{
    id: string
    option_text: string
    score_value: number
    option_order: number
  }>
}

interface AssessmentState {
  assessment_id: string
  questions: Question[]
  current_question: number
  answers: Record<string, string>
  loading: boolean
  error: string | null
}

export function AssessmentFlow() {
  const router = useRouter()
  const [step, setStep] = useState<"intro" | "details" | "assessment" | "results">("intro")
  const [ageGroup, setAgeGroup] = useState<string>("")
  const [language, setLanguage] = useState<string>("en")
  const [assessment, setAssessment] = useState<AssessmentState | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Step 1: Start assessment
  const handleStartAssessment = async () => {
    if (!ageGroup) {
      alert("Please select an age group")
      return
    }

    setAssessment({
      assessment_id: "",
      questions: [],
      current_question: 0,
      answers: {},
      loading: true,
      error: null,
    })

    try {
      const response = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age_group: ageGroup.toLowerCase(),
          language,
          assessment_type: "screening",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to start assessment")
      }

      const data = await response.json()
      setAssessment({
        assessment_id: data.assessment_id,
        questions: data.questions,
        current_question: 0,
        answers: {},
        loading: false,
        error: null,
      })
      setStep("assessment")
    } catch (err) {
      setAssessment((prev) =>
        prev
          ? {
              ...prev,
              loading: false,
              error: err instanceof Error ? err.message : "Unknown error",
            }
          : null
      )
    }
  }

  // Step 2: Record answer
  const handleAnswerQuestion = async (optionId: string) => {
    if (!assessment) return

    const currentQuestion = assessment.questions[assessment.current_question]
    setAssessment((prev) =>
      prev
        ? {
            ...prev,
            answers: {
              ...prev.answers,
              [currentQuestion.id]: optionId,
            },
          }
        : null
    )

    try {
      const response = await fetch("/api/assessment/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessment.assessment_id,
          question_id: currentQuestion.id,
          option_id: optionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to record answer")
      }
    } catch (err) {
      console.error("[v0] Error recording answer:", err)
    }
  }

  // Step 3: Move to next question
  const handleNextQuestion = () => {
    if (!assessment) return

    const currentQuestion = assessment.questions[assessment.current_question]
    if (!assessment.answers[currentQuestion.id]) {
      alert("Please select an answer before continuing")
      return
    }

    if (assessment.current_question < assessment.questions.length - 1) {
      setAssessment((prev) =>
        prev
          ? {
              ...prev,
              current_question: prev.current_question + 1,
            }
          : null
      )
    } else {
      // All questions answered - complete assessment
      handleCompleteAssessment()
    }
  }

  const handlePreviousQuestion = () => {
    if (!assessment || assessment.current_question === 0) return
    setAssessment((prev) =>
      prev
        ? {
            ...prev,
            current_question: prev.current_question - 1,
          }
        : null
    )
  }

  // Step 4: Complete assessment
  const handleCompleteAssessment = async () => {
    if (!assessment) return
    setSubmitting(true)

    try {
      const response = await fetch("/api/assessment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessment.assessment_id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to complete assessment")
      }

      const results = await response.json()
      setAssessment((prev) =>
        prev
          ? {
              ...prev,
              ...results,
            }
          : null
      )
      setStep("results")
    } catch (err) {
      setAssessment((prev) =>
        prev
          ? {
              ...prev,
              error: err instanceof Error ? err.message : "Failed to complete assessment",
            }
          : null
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Render intro screen
  if (step === "intro") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Self-Screening Assessment
            </CardTitle>
            <CardDescription>
              Discover insights about your neurodiversity traits in 10-15 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold">How this works:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Answer questions about yourself or someone you care for</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Get personalized insights across 6 neurodiversity domains</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Receive tailored resources and next steps</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  This is a screening tool, not a diagnosis. Please consult with a healthcare professional for proper
                  evaluation.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Who is this assessment for?</label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Child (0-12 years)</SelectItem>
                    <SelectItem value="teen">Teen (13-17 years)</SelectItem>
                    <SelectItem value="adult">Adult (18+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleStartAssessment} size="lg" className="w-full">
              Start Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render assessment screen
  if (step === "assessment" && assessment && assessment.questions.length > 0) {
    const currentQuestion = assessment.questions[assessment.current_question]
    const progress = ((assessment.current_question + 1) / assessment.questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">{currentQuestion.domain.toUpperCase()}</Badge>
              <span className="text-sm text-muted-foreground">
                Question {assessment.current_question + 1} of {assessment.questions.length}
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            <CardTitle>{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={assessment.answers[currentQuestion.id] || ""}
              onValueChange={handleAnswerQuestion}
            >
              <div className="space-y-3">
                {currentQuestion.assessment_options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="cursor-pointer font-normal">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={assessment.current_question === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNextQuestion} disabled={submitting}>
                {assessment.current_question === assessment.questions.length - 1 ? "Complete" : "Next"}
                {submitting && <Loader className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render results screen
  if (step === "results" && assessment) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Assessment Complete!
            </CardTitle>
            <CardDescription>Here are your personalized insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Primary Domain</h3>
              <p className="text-green-800">{assessment.primary_domain}</p>
            </div>

            {assessment.secondary_domains && assessment.secondary_domains.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Secondary Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {assessment.secondary_domains.map((domain) => (
                    <Badge key={domain} variant="secondary">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {assessment.summary_insights && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Your Insights</h3>
                <p className="text-sm text-blue-800">{assessment.summary_insights}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => router.push("/resources")} variant="outline">
                Explore Resources
              </Button>
              <Button onClick={() => router.push("/iep")}>Create IEP</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
