'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import Link from 'next/link'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MyCoursesPage() {
  const [courses] = useState([
    {
      id: 1,
      title: 'Understanding ADHD',
      instructor: 'Dr. Sarah Johnson',
      progress: 75,
      status: 'In Progress',
      enrollDate: '2026-03-15',
      certificate: false,
    },
    {
      id: 2,
      title: 'Autism Spectrum: A Complete Guide',
      instructor: 'Prof. David Chen',
      progress: 100,
      status: 'Completed',
      enrollDate: '2025-12-01',
      certificate: true,
    },
    {
      id: 3,
      title: 'Inclusive Classroom Design',
      instructor: 'Ms. Emily Rodriguez',
      progress: 45,
      status: 'In Progress',
      enrollDate: '2026-04-20',
      certificate: false,
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground text-lg">Continue learning and earn certifications</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/learning">
              <Icons.Plus className="mr-2 h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="active" className="mb-8">
          <TabsList>
            <TabsTrigger value="active">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>

          {/* In Progress */}
          <TabsContent value="active" className="mt-6">
            <div className="space-y-4">
              {courses.filter(c => c.status === 'In Progress').map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{course.title}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {course.progress}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Instructor: {course.instructor}</p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">Enrolled: {new Date(course.enrollDate).toLocaleDateString()}</p>
                      </div>

                      <Button asChild>
                        <Link href={`/learning/${course.id}`}>
                          <Icons.Play className="mr-2 h-4 w-4" />
                          Continue Learning
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {courses.filter(c => c.status === 'Completed').map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Icons.CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                          <h3 className="text-xl font-bold">{course.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Instructor: {course.instructor}</p>
                        <p className="text-sm text-muted-foreground">Completed: {new Date(course.enrollDate).toLocaleDateString()}</p>
                      </div>

                      <div className="flex gap-2">
                        {course.certificate && (
                          <Button asChild variant="outline">
                            <Link href={`/learning/${course.id}/certificate`}>
                              <Icons.Award className="mr-2 h-4 w-4" />
                              Certificate
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="outline">
                          <Link href={`/learning/${course.id}`}>Review Course</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist</CardTitle>
                <CardDescription>Courses you want to take later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Icons.BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                  <Button asChild>
                    <Link href="/learning">Explore Courses</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses.filter(c => c.status === 'Completed').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certificates Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses.filter(c => c.certificate).length}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
