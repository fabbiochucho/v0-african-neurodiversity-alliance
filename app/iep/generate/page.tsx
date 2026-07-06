"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"
import { IEPService } from "@/lib/iep-service"
import type { DiagnosisDomain, GeneratedGoal, LearnerProfile } from "@/lib/types/iep"
import Link from "next/link"

type LearnerDraft = Pick<LearnerProfile, "name" | "age" | "gender" | "country" | "diagnosis_domains">

export default function GenerateIEPPage() {
  const [step, setStep] = useState<"profile" | "domains" | "goals" | "review">("profile")
  const [profile, setProfile] = useState<Partial<LearnerDraft>>({
    name: "",
    age: 0,
    gender: "",
    diagnosis_domains: [],
    country: "",
  })
  const [goals, setGoals] = useState<GeneratedGoal[]>([])
  const [customGoals, setCustomGoals] = useState<Partial<GeneratedGoal>[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const DIAGNOSIS_OPTIONS: DiagnosisDomain[] = ["ASD", "ADHD", "Dyslexia", "Dyspraxia", "Sensory", "Cognitive"]

  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleDomainToggle = (domain: DiagnosisDomain) => {
    setProfile((prev) => ({
      ...prev,
      diagnosis_domains: prev.diagnosis_domains?.includes(domain)
        ? prev.diagnosis_domains.filter((d) => d !== domain)
        : [...(prev.diagnosis_domains || []), domain],
    }))
  }

  const handleGenerateGoals = () => {
    if (profile.diagnosis_domains && profile.diagnosis_domains.length > 0) {
      const generatedGoals = IEPService.generateAdaptiveGoals(profile as LearnerDraft)
      setGoals(generatedGoals)
      setStep("goals")
    }
  }

  const handleAddCustomGoal = () => {
    setCustomGoals((prev) => [
      ...prev,
      {
        domain: "academic",
        goal_description: "",
        target_metric: "",
        timeline: "3 months",
        notes: "",
      },
    ])
  }

  const handleCustomGoalChange = (index: number, field: string, value: any) => {
    setCustomGoals((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleRemoveCustomGoal = (index: number) => {
    setCustomGoals((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateIEP = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const completeCustomGoals = customGoals.filter((g) => g.goal_description) as GeneratedGoal[]
      const allGoals = [...goals, ...completeCustomGoals]
      const summary = IEPService.generateIEPSummary(profile as LearnerDraft, allGoals)

      // 1. Create the learner profile
      const learnerResponse = await fetch("/api/iep/learner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          country: profile.country,
          diagnosis_domains: profile.diagnosis_domains || [],
        }),
      })

      const learner = await learnerResponse.json()

      if (!learnerResponse.ok) {
        throw new Error(learner.error || "Failed to create learner profile")
      }

      // 2. Create the IEP for that learner
      const iepResponse = await fetch("/api/iep/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learner_id: learner.id,
          title: `IEP for ${profile.name}`,
          description: `Individualized Education Plan for ${profile.name}, generated ${new Date().toLocaleDateString()}`,
          adaptive_goals: goals,
          custom_goals: completeCustomGoals,
          ai_summary: summary,
        }),
      })

      const iep = await iepResponse.json()

      if (!iepResponse.ok) {
        throw new Error(iep.error || "Failed to create IEP")
      }

      window.location.href = "/iep/dashboard"
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link href="/iep" className="inline-flex items-center gap-2 text-[#3C9C87] hover:underline mb-4">
              <Icons.ArrowLeft className="h-4 w-4" />
              Back to IEP Tracker
            </Link>
            <h1 className="text-4xl font-bold text-balance mb-4">Generate Personalized IEP</h1>
            <p className="text-xl text-muted-foreground">
              Create an adaptive Individualized Education Plan tailored to your learner's needs.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex gap-2 mb-12 overflow-x-auto pb-2">
            {["profile", "domains", "goals", "review"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step === s
                      ? "bg-[#3C9C87] text-white"
                      : ["profile", "domains", "goals"].includes(s) &&
                          ["profile", "domains", "goals", "review"].indexOf(step) > i
                        ? "bg-[#3C9C87]/20 text-[#3C9C87]"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-sm font-medium capitalize hidden sm:inline">{s}</span>
                {i < 3 && <div className="w-8 h-0.5 bg-muted hidden sm:block" />}
              </div>
            ))}
          </div>

          {/* Step 1: Profile Information */}
          {step === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Learner Profile</CardTitle>
                <CardDescription>Enter basic information about the learner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Learner Name</label>
                    <input
                      type="text"
                      value={profile.name || ""}
                      onChange={(e) => handleProfileChange("name", e.target.value)}
                      placeholder="Enter learner's name"
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Age</label>
                    <input
                      type="number"
                      value={profile.age || ""}
                      onChange={(e) => handleProfileChange("age", Number.parseInt(e.target.value))}
                      placeholder="Enter age"
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <select
                      value={profile.gender || ""}
                      onChange={(e) => handleProfileChange("gender", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input
                      type="text"
                      value={profile.country || ""}
                      onChange={(e) => handleProfileChange("country", e.target.value)}
                      placeholder="Enter country"
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    onClick={() => setStep("domains")}
                    disabled={!profile.name || !profile.age || !profile.country}
                    className="bg-[#3C9C87] hover:bg-[#2d7a6a]"
                  >
                    Next: Select Diagnosis Domains
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Diagnosis Domains */}
          {step === "domains" && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnosis Domains</CardTitle>
                <CardDescription>Select the neurodivergent domains that apply to this learner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DIAGNOSIS_OPTIONS.map((domain) => (
                    <div
                      key={domain}
                      onClick={() => handleDomainToggle(domain)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        profile.diagnosis_domains?.includes(domain)
                          ? "border-[#3C9C87] bg-[#3C9C87]/5"
                          : "border-muted hover:border-[#3C9C87]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            profile.diagnosis_domains?.includes(domain)
                              ? "bg-[#3C9C87] border-[#3C9C87]"
                              : "border-muted"
                          }`}
                        >
                          {profile.diagnosis_domains?.includes(domain) && (
                            <Icons.Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{domain}</div>
                          <div className="text-sm text-muted-foreground">
                            {domain === "ASD" && "Autism Spectrum Disorder"}
                            {domain === "ADHD" && "Attention-Deficit/Hyperactivity Disorder"}
                            {domain === "Dyslexia" && "Reading and language processing"}
                            {domain === "Dyspraxia" && "Motor coordination and planning"}
                            {domain === "Sensory" && "Sensory processing differences"}
                            {domain === "Cognitive" && "Cognitive and executive function"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="outline" onClick={() => setStep("profile")} className="bg-transparent">
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerateGoals}
                    disabled={!profile.diagnosis_domains || profile.diagnosis_domains.length === 0}
                    className="bg-[#3C9C87] hover:bg-[#2d7a6a]"
                  >
                    Generate Adaptive Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Customize Goals */}
          {step === "goals" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Goals</CardTitle>
                  <CardDescription>Review and customize the adaptive goals generated for this learner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.map((goal, index) => (
                    <div key={`${goal.domain}-${index}`} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="capitalize">
                              {goal.domain}
                            </Badge>
                          </div>
                          <h4 className="font-semibold">{goal.goal_description}</h4>
                          <p className="text-sm text-muted-foreground mt-1">Target: {goal.target_metric}</p>
                          <p className="text-sm text-muted-foreground">Timeline: {goal.timeline}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Custom Goals</CardTitle>
                  <CardDescription>Add additional goals specific to this learner's needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customGoals.map((goal, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Domain</label>
                          <select
                            value={goal.domain || ""}
                            onChange={(e) => handleCustomGoalChange(index, "domain", e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-background"
                          >
                            <option value="">Select domain</option>
                            <option value="communication">Communication</option>
                            <option value="sensory">Sensory</option>
                            <option value="academic">Academic</option>
                            <option value="motor">Motor</option>
                            <option value="attention">Attention</option>
                            <option value="behavior">Behavior</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Timeline</label>
                          <input
                            type="text"
                            value={goal.timeline || ""}
                            onChange={(e) => handleCustomGoalChange(index, "timeline", e.target.value)}
                            placeholder="e.g., 3 months"
                            className="w-full px-3 py-2 border rounded-lg bg-background"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Goal Description</label>
                        <textarea
                          value={goal.goal_description || ""}
                          onChange={(e) => handleCustomGoalChange(index, "goal_description", e.target.value)}
                          placeholder="Describe the goal"
                          className="w-full px-3 py-2 border rounded-lg bg-background"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Target Metric</label>
                        <input
                          type="text"
                          value={goal.target_metric || ""}
                          onChange={(e) => handleCustomGoalChange(index, "target_metric", e.target.value)}
                          placeholder="How will progress be measured?"
                          className="w-full px-3 py-2 border rounded-lg bg-background"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveCustomGoal(index)}
                        className="w-full"
                      >
                        Remove Goal
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={handleAddCustomGoal}
                    className="w-full bg-transparent border-dashed"
                  >
                    <Icons.Plus className="h-4 w-4 mr-2" />
                    Add Custom Goal
                  </Button>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep("domains")} className="bg-transparent">
                  Back
                </Button>
                <Button onClick={() => setStep("review")} className="bg-[#3C9C87] hover:bg-[#2d7a6a]">
                  Review & Create IEP
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === "review" && (
            <Card>
              <CardHeader>
                <CardTitle>Review IEP Summary</CardTitle>
                <CardDescription>Review the complete IEP before creating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Learner Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span> {profile.name}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Age:</span> {profile.age}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gender:</span> {profile.gender}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Country:</span> {profile.country}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Diagnosis Domains</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.diagnosis_domains?.map((domain) => (
                        <Badge key={domain} variant="secondary">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">IEP Summary</h3>
                    <p className="text-sm leading-relaxed">
                      {IEPService.generateIEPSummary(profile as LearnerDraft, [
                        ...goals,
                        ...(customGoals.filter((g) => g.goal_description) as GeneratedGoal[]),
                      ])}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Total Goals</h3>
                    <p className="text-sm">
                      {goals.length + customGoals.length} goals ({goals.length} adaptive + {customGoals.length} custom)
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep("goals")} className="bg-transparent">
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateIEP}
                    disabled={isSubmitting}
                    className="bg-[#3C9C87] hover:bg-[#2d7a6a]"
                  >
                    {isSubmitting ? "Creating IEP..." : "Create IEP"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
