'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ModeratorDashboardPage() {
  const stats = {
    flaggedItems: 12,
    reviewedToday: 8,
    actionsToday: 5,
    pendingReview: 3,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Moderator Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage community content and discussions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.flaggedItems}</div>
              <p className="text-xs text-orange-600 mt-1">{stats.pendingReview} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviewed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.reviewedToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Actions Taken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.actionsToday}</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2.3h</div>
              <p className="text-xs text-green-600 mt-1">Avg. within target</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="queue" className="mb-8">
          <TabsList>
            <TabsTrigger value="queue">Review Queue</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="actions">Moderation Log</TabsTrigger>
          </TabsList>

          {/* Review Queue */}
          <TabsContent value="queue" className="mt-6">
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  type: 'Post',
                  category: 'ADHD Support Group',
                  content: 'Contains potentially harmful medical advice',
                  reports: 3,
                  author: 'user_123',
                  time: '30 mins ago',
                  severity: 'high',
                },
                {
                  id: 2,
                  type: 'Comment',
                  category: 'Autism Spectrum Community',
                  content: 'Offensive language towards members',
                  reports: 2,
                  author: 'user_456',
                  time: '2 hours ago',
                  severity: 'high',
                },
                {
                  id: 3,
                  type: 'Post',
                  category: 'General',
                  content: 'Possible spam/commercial content',
                  reports: 1,
                  author: 'user_789',
                  time: '4 hours ago',
                  severity: 'medium',
                },
              ].map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {item.type} in {item.category}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.content}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.severity === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Reported by {item.reports} user(s) • {item.time} • By {item.author}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Icons.Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icons.Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icons.AlertCircle className="mr-2 h-4 w-4" />
                        Warn User
                      </Button>
                      <Button size="sm" variant="outline">
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guidelines */}
          <TabsContent value="guidelines" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
                <CardDescription>Rules for content moderation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: 'Respectful Communication',
                    description: 'All members must be respectful of others. No harassment, bullying, or discrimination.',
                  },
                  {
                    title: 'No Medical Misinformation',
                    description: 'Do not provide medical advice. Encourage users to consult healthcare professionals.',
                  },
                  {
                    title: 'Privacy and Confidentiality',
                    description: 'Do not share personal information of others without consent.',
                  },
                  {
                    title: 'No Spam',
                    description: 'Do not post commercial content, links, or repetitive messages.',
                  },
                  {
                    title: 'Sensitive Topics',
                    description: 'Content about self-harm, suicide, or abuse must be handled with care and resources.',
                  },
                ].map((guideline, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <p className="font-medium mb-1">{guideline.title}</p>
                    <p className="text-sm text-muted-foreground">{guideline.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Log */}
          <TabsContent value="actions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Log</CardTitle>
                <CardDescription>Your recent moderation actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Deleted Post', item: 'Medical misinformation in ADHD Group', time: '10 mins ago' },
                    { action: 'Warned User', item: 'user_456 for offensive language', time: '1 hour ago' },
                    { action: 'Approved Post', item: 'Resource recommendation in Autism Group', time: '2 hours ago' },
                    { action: 'Suspended User', item: 'user_789 for repeated spam', time: '5 hours ago' },
                  ].map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-muted-foreground text-xs">{log.item}</p>
                      </div>
                      <span className="text-muted-foreground text-xs">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
