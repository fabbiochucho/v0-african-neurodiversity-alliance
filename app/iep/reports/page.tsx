"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/lib/icons"
import { createClient } from "@/lib/supabase/client"
import type { LearnerProfile, Report } from "@/lib/types/iep"

type ReportRow = Report & { learner_profiles: { name: string } | null }

export default function IEPReportsPage() {
  const router = useRouter()
  const [learners, setLearners] = useState<LearnerProfile[]>([])
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLearner, setSelectedLearner] = useState<string>("")
  const [reportType, setReportType] = useState<"monthly" | "quarterly">("monthly")
  const [reportPeriod, setReportPeriod] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailDrafts, setEmailDrafts] = useState<Record<string, string>>({})
  const [sendingReportId, setSendingReportId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const [learnersRes, reportsRes] = await Promise.all([fetch("/api/iep/learner"), fetch("/api/reports")])
        const learnersData = await learnersRes.json()
        const reportsData = await reportsRes.json()
        setLearners(Array.isArray(learnersData) ? learnersData : [])
        setReports(Array.isArray(reportsData) ? reportsData : [])
      } catch {
        setError("Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = async () => {
    if (!selectedLearner || !reportPeriod) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learner_id: selectedLearner,
          report_type: reportType,
          report_period: reportPeriod,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate report")

      const learnerName = learners.find((l) => l.id === selectedLearner)?.name
      setReports((prev) => [{ ...data, learner_profiles: { name: learnerName || "" } }, ...prev])
      setReportPeriod("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
    } finally {
      setGenerating(false)
    }
  }

  const handleSendEmail = async (reportId: string) => {
    const recipientEmail = emailDrafts[reportId]
    if (!recipientEmail) return
    setSendingReportId(reportId)
    setError(null)

    try {
      const res = await fetch("/api/reports/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: reportId, recipient_email: recipientEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send email")

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, email_sent: true, email_sent_at: new Date().toISOString() } : r)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email")
    } finally {
      setSendingReportId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <Link href="/iep/dashboard" className="inline-flex items-center gap-2 text-[#3C9C87] hover:underline mb-4">
              <Icons.ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-balance mb-2">Reports</h1>
            <p className="text-muted-foreground">Generate branded progress reports and email them to stakeholders.</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate a New Report</CardTitle>
              <CardDescription>Pick a learner and period to compile a progress report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedLearner} onValueChange={setSelectedLearner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select learner" />
                  </SelectTrigger>
                  <SelectContent>
                    {learners.map((learner) => (
                      <SelectItem key={learner.id} value={learner.id}>
                        {learner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={reportType} onValueChange={(v) => setReportType(v as "monthly" | "quarterly")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="e.g. July 2026"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                onClick={handleGenerate}
                disabled={generating || !selectedLearner || !reportPeriod || learners.length === 0}
                className="bg-[#3C9C87] hover:bg-[#2d7a6a]"
              >
                {generating ? "Generating..." : "Generate Report"}
              </Button>
              {learners.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">
                  Create an IEP first from the{" "}
                  <Link href="/iep/generate" className="text-[#3C9C87] hover:underline">
                    generator
                  </Link>
                  .
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading reports...</p>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icons.FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                  <p className="text-muted-foreground">Generate your first report using the form above.</p>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {report.report_type} Report — {report.learner_profiles?.name || "Learner"}
                        </CardTitle>
                        <CardDescription>
                          {report.report_period} &middot; {new Date(report.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {report.email_sent ? (
                        <Badge className="bg-[#3C9C87]/10 text-[#3C9C87]">Emailed</Badge>
                      ) : (
                        <Badge variant="outline">Not sent</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      {report.content}
                    </pre>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="recipient@example.com"
                        value={emailDrafts[report.id] || ""}
                        onChange={(e) => setEmailDrafts((prev) => ({ ...prev, [report.id]: e.target.value }))}
                      />
                      <Button
                        variant="outline"
                        className="bg-transparent"
                        disabled={sendingReportId === report.id || !emailDrafts[report.id]}
                        onClick={() => handleSendEmail(report.id)}
                      >
                        <Icons.Mail className="h-4 w-4 mr-2" />
                        {sendingReportId === report.id ? "Sending..." : "Send Email"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
