"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, BookOpen, ExternalLink, FlaskConical } from "lucide-react"

interface Paper {
  id: string
  title: string
  authors: string
  journal: string
  year: number | null
  summary: string
  url: string
  countryFocus: string
  verified: boolean
}

interface Initiative {
  id: string
  name: string
  institution: string
  description: string
  url: string
  verified: boolean
}

const emptySubmission = {
  title: "",
  authors: "",
  journal: "",
  year: "",
  summary: "",
  url: "",
  submittedByEmail: "",
}

export default function ResearchPage() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [submitOpen, setSubmitOpen] = useState(false)
  const [submission, setSubmission] = useState(emptySubmission)
  const [submitting, setSubmitting] = useState(false)
  const [submitDone, setSubmitDone] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: paperRows }, { data: initiativeRows }] = await Promise.all([
        supabase.from("research_papers").select("*").eq("is_published", true).order("year", { ascending: false }),
        supabase.from("research_initiatives").select("*").eq("is_published", true),
      ])

      setPapers(
        (paperRows || []).map((r) => ({
          id: r.id,
          title: r.title,
          authors: r.authors || "",
          journal: r.journal || "",
          year: r.year,
          summary: r.summary || "",
          url: r.url || "",
          countryFocus: r.country_focus || "",
          verified: r.verified || false,
        })),
      )
      setInitiatives(
        (initiativeRows || []).map((r) => ({
          id: r.id,
          name: r.name,
          institution: r.institution || "",
          description: r.description || "",
          url: r.url || "",
          verified: r.verified || false,
        })),
      )
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!submission.title.trim()) return
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from("research_paper_submissions").insert({
      title: submission.title.trim(),
      authors: submission.authors.trim() || null,
      journal: submission.journal.trim() || null,
      year: submission.year ? Number(submission.year) : null,
      summary: submission.summary.trim() || null,
      url: submission.url.trim() || null,
      submitted_by_email: submission.submittedByEmail.trim() || null,
    })
    setSubmitting(false)
    if (!error) {
      setSubmitDone(true)
      setSubmission(emptySubmission)
    }
  }

  const filteredPapers = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.countryFocus.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              Research & Evidence
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-balance mb-6">
              Advancing <span className="text-primary">Neurodiversity Research</span> in Africa
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto">
              Real, published research and active research initiatives on neurodiversity from African institutions
              and researchers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent"
                onClick={() => {
                  setSubmission(emptySubmission)
                  setSubmitDone(false)
                  setSubmitOpen(true)
                }}
              >
                Submit Research
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Research Stats */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{papers.length}</div>
              <div className="text-sm text-muted-foreground">Published Studies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">
                {new Set(papers.map((p) => p.journal).filter(Boolean)).size}
              </div>
              <div className="text-sm text-muted-foreground">Journals Represented</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {new Set(papers.flatMap((p) => p.countryFocus.split(",").map((c) => c.trim())).filter(Boolean)).size}
              </div>
              <div className="text-sm text-muted-foreground">Countries Represented</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{initiatives.length}</div>
              <div className="text-sm text-muted-foreground">Active Initiatives</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or country..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Published Research */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Published Research</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real, verifiable papers on neurodiversity in African contexts
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : filteredPapers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No published research found</p>
              <p className="text-sm">Be the first to submit a study for this research library.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPapers.map((paper) => (
                <Card key={paper.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex gap-2 flex-wrap">
                          {paper.countryFocus && <Badge variant="outline">{paper.countryFocus}</Badge>}
                          {paper.verified && <Badge variant="secondary">Verified</Badge>}
                        </div>
                        {paper.year && <div className="text-sm text-muted-foreground">{paper.year}</div>}
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                          {paper.title}
                        </h3>
                        {paper.authors && <div className="text-sm text-muted-foreground mb-1">{paper.authors}</div>}
                        {paper.journal && <div className="text-sm font-medium text-secondary mb-3">{paper.journal}</div>}
                        <p className="text-muted-foreground text-sm leading-relaxed">{paper.summary}</p>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t">
                        <Button size="sm" disabled={!paper.url} asChild={Boolean(paper.url)}>
                          {paper.url ? (
                            <a href={paper.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                              View Paper
                            </a>
                          ) : (
                            <span>View Paper</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Research Initiatives */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Active Research Initiatives</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real, currently-active research centers and consortia relevant to neurodiversity in Africa
            </p>
          </div>

          {loading ? null : initiatives.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FlaskConical className="h-10 w-10 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-1">No initiatives listed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {initiatives.map((init) => (
                <Card key={init.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <FlaskConical className="h-5 w-5 text-primary" />
                      {init.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardTitle>{init.name}</CardTitle>
                    {init.institution && <CardDescription>{init.institution}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{init.description}</p>
                    <Button size="sm" variant="outline" disabled={!init.url} asChild={Boolean(init.url)}>
                      {init.url ? (
                        <a href={init.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                          Visit Site
                        </a>
                      ) : (
                        <span>Visit Site</span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">
            Contribute to Neurodiversity Research in Africa
          </h2>
          <p className="text-xl opacity-90 text-pretty mb-8 max-w-2xl mx-auto">
            Know a real, published study or active research initiative we&apos;re missing? Submit it for review.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => {
                setSubmission(emptySubmission)
                setSubmitDone(false)
                setSubmitOpen(true)
              }}
            >
              Submit Research
            </Button>
          </div>
        </div>
      </section>

      {/* Submit dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          {submitDone ? (
            <>
              <DialogHeader>
                <DialogTitle>Thank you!</DialogTitle>
                <DialogDescription>
                  Your submission has been received and will be reviewed before being added to the library.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setSubmitOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Submit Research</DialogTitle>
                <DialogDescription>Submissions are reviewed before being published.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rp-title">Title *</Label>
                  <Input
                    id="rp-title"
                    value={submission.title}
                    onChange={(e) => setSubmission({ ...submission, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp-authors">Authors</Label>
                  <Input
                    id="rp-authors"
                    value={submission.authors}
                    onChange={(e) => setSubmission({ ...submission, authors: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rp-journal">Journal / Publisher</Label>
                    <Input
                      id="rp-journal"
                      value={submission.journal}
                      onChange={(e) => setSubmission({ ...submission, journal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rp-year">Year</Label>
                    <Input
                      id="rp-year"
                      type="number"
                      value={submission.year}
                      onChange={(e) => setSubmission({ ...submission, year: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp-summary">Summary</Label>
                  <Textarea
                    id="rp-summary"
                    value={submission.summary}
                    onChange={(e) => setSubmission({ ...submission, summary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp-url">DOI or URL</Label>
                  <Input
                    id="rp-url"
                    value={submission.url}
                    onChange={(e) => setSubmission({ ...submission, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp-email">Your email (optional)</Label>
                  <Input
                    id="rp-email"
                    value={submission.submittedByEmail}
                    onChange={(e) => setSubmission({ ...submission, submittedByEmail: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || !submission.title.trim()}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
