'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/lib/icons'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardStats {
  assessmentCompleted: boolean
  iepsCreated: number
  forumPosts: number
  coursesEnrolled: number
  resourcesSaved: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    assessmentCompleted: false,
    iepsCreated: 0,
    forumPosts: 0,
    coursesEnrolled: 0,
    resourcesSaved: 0,
  })

  useEffect(() => {
    // Fetch user stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.log('[v0] Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Your ANDA Dashboard</h1>
          <p className="text-muted-foreground text-lg">Your neurodiversity journey starts here</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Assessment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assessmentCompleted ? '✓' : '—'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.assessmentCompleted ? 'Completed' : 'Not Started'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">IEPs Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.iepsCreated}</div>
              <p className="text-xs text-muted-foreground mt-1">Active plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Forum Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.forumPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">Community engagement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.coursesEnrolled}</div>
              <p className="text-xs text-muted-foreground mt-1">Enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saved Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resourcesSaved}</div>
              <p className="text-xs text-muted-foreground mt-1">Bookmarks</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Assessment Card */}
          <Card className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icons.Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Self-Assessment</CardTitle>
              <CardDescription>Take or retake your neurodiversity assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/self-test">
                  {stats.assessmentCompleted ? 'Retake Assessment' : 'Start Assessment'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* IEP Card */}
          <Card className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <Icons.FileText className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>IEP Management</CardTitle>
              <CardDescription>Create, view, and manage your IEPs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/iep/dashboard">View IEPs</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Icons.TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>Log and monitor your daily progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/progress">View Progress</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Community Card */}
          <Card className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                <Icons.Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Community Forum</CardTitle>
              <CardDescription>Connect with peers and get support</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/community">Join Forum</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Learning Card */}
          <Card className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Icons.BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Learning Platform</CardTitle>
              <CardDescription>Access courses and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/my-courses">My Courses</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card className="group hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Icons.Archive className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Resources</CardTitle>
              <CardDescription>Explore tools, apps, and guides</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/my-resources">My Resources</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions on ANDA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Icons.CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Self-Assessment Completed</p>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Icons.MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Posted in Community Forum</p>
                    <p className="text-sm text-muted-foreground">5 days ago</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Icons.Bookmark className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Saved 3 Resources</p>
                    <p className="text-sm text-muted-foreground">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
