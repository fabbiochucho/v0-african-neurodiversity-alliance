'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminDashboardPage() {
  const stats = {
    totalUsers: 12543,
    activeToday: 3421,
    newToday: 145,
    assessmentsCompleted: 8765,
    forumPosts: 45230,
    resourcesSaved: 32104,
    systemUptime: 99.97,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">System overview and management</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">↑ {stats.newToday} today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeToday.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">27% of total users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.systemUptime}%</div>
              <p className="text-xs text-green-600 mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">API Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">●</div>
              <p className="text-xs text-green-600 mt-1">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Assessments Completed</span>
                    <span className="font-bold">{stats.assessmentsCompleted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Forum Posts</span>
                    <span className="font-bold">{stats.forumPosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Resources Saved</span>
                    <span className="font-bold">{stats.resourcesSaved.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start">
                    <Icons.Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Icons.Flag className="mr-2 h-4 w-4" />
                    Review Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Icons.Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Jane Doe', role: 'Parent', joined: '2026-01-15', status: 'Active' },
                    { name: 'John Smith', role: 'Educator', joined: '2026-02-20', status: 'Active' },
                    { name: 'Sarah Johnson', role: 'Self-Advocate', joined: '2026-03-10', status: 'Inactive' },
                  ].map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.role} • Joined {user.joined}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.status}
                        </span>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation */}
          <TabsContent value="moderation" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Queue</CardTitle>
                <CardDescription>Review flagged content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Post', content: 'Inappropriate language in forum', reports: 3 },
                    { type: 'Comment', content: 'Spam in ADHD Support Group', reports: 5 },
                    { type: 'User', content: 'Multiple reports of harassment', reports: 7 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.type}: {item.content}</p>
                        <p className="text-sm text-muted-foreground">{item.reports} reports</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Review</Button>
                        <Button size="sm">Action</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <Icons.Download className="mr-2 h-4 w-4" />
                  User Activity Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Icons.Download className="mr-2 h-4 w-4" />
                  System Performance Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Icons.Download className="mr-2 h-4 w-4" />
                  Community Engagement Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
