'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useState } from 'react'

export default function ProgressPage() {
  const [progressData] = useState({
    dailyEntries: 24,
    thisWeekAverage: 78,
    thisMonthAverage: 75,
    streak: 8,
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-muted-foreground text-lg">Monitor your journey and celebrate wins</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Daily Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progressData.dailyEntries}</div>
              <p className="text-xs text-muted-foreground mt-1">Total logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progressData.thisWeekAverage}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progressData.thisMonthAverage}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progressData.streak} days</div>
              <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="daily" className="mb-8">
          <TabsList>
            <TabsTrigger value="daily">Daily Log</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Progress Log</CardTitle>
                <CardDescription>Track your daily activities and mood</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <div key={day} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div>
                        <p className="font-medium">Today - {new Date(Date.now() - day * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Mood: Good | Energy: High | Tasks: 5/7</p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">Add Today's Entry</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>Overview of this week's progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="font-medium mb-2">Week Overview</p>
                    <div className="grid grid-cols-7 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={day} className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">{day}</p>
                          <div className={`h-12 rounded-lg flex items-center justify-center text-sm font-bold ${idx < 5 ? 'bg-green-500/20 text-green-700' : 'bg-gray-200'}`}>
                            {idx < 5 ? '85%' : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Report</CardTitle>
                <CardDescription>Your progress report for the month</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="#download">
                    <Icons.Download className="mr-2 h-4 w-4" />
                    Generate Monthly Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Goals Section */}
        <Card>
          <CardHeader>
            <CardTitle>IEP Goals Progress</CardTitle>
            <CardDescription>Track progress towards your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Improve focus during schoolwork', 'Develop social skills', 'Manage stress and anxiety'].map((goal, idx) => (
                <div key={goal} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium mb-1">{goal}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${65 + idx * 10}%` }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{65 + idx * 10}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
