'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import Link from 'next/link'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MyResourcesPage() {
  const [savedResources] = useState([
    {
      id: 1,
      title: 'ADHD Management Guide',
      category: 'ADHD',
      type: 'Guide',
      rating: 4.8,
      reviews: 245,
      saved: true,
    },
    {
      id: 2,
      title: 'Autism Spectrum Toolkit',
      category: 'Autism',
      type: 'Toolkit',
      rating: 4.9,
      reviews: 312,
      saved: true,
    },
    {
      id: 3,
      title: 'Dyslexia Accommodation Strategies',
      category: 'Dyslexia',
      type: 'Article',
      rating: 4.6,
      reviews: 189,
      saved: true,
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Resources</h1>
          <p className="text-muted-foreground text-lg">Manage your saved and recommended resources</p>
        </div>

        <Tabs defaultValue="saved" className="mb-8">
          <TabsList>
            <TabsTrigger value="saved">Saved ({savedResources.length})</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
          </TabsList>

          {/* Saved Resources */}
          <TabsContent value="saved" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription>{resource.category}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Icons.Bookmark className="h-5 w-5 fill-current" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 bg-accent/50 rounded text-xs font-medium mb-3">
                        {resource.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {Array(5).fill(0).map((_, i) => (
                          <Icons.Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(resource.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{resource.rating} ({resource.reviews} reviews)</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/directory?resource=${resource.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommended */}
          <TabsContent value="recommended" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your assessment results and interests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'ADHD Medication Guide', category: 'ADHD' },
                    { title: 'School Accommodation Form Template', category: 'Education' },
                    { title: 'Workplace Disclosure Guide', category: 'Career' },
                  ].map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div>
                        <p className="font-medium">{rec.title}</p>
                        <p className="text-sm text-muted-foreground">{rec.category}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Icons.Plus className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections */}
          <TabsContent value="collections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Collections</CardTitle>
                <CardDescription>Organize your resources into collections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'ADHD Support', count: 12 },
                    { name: 'Educational Tools', count: 8 },
                    { name: 'Workplace Resources', count: 5 },
                  ].map((collection, idx) => (
                    <Card key={idx} className="border">
                      <CardContent className="pt-6">
                        <p className="font-medium">{collection.name}</p>
                        <p className="text-sm text-muted-foreground mb-4">{collection.count} resources</p>
                        <Button variant="outline" size="sm" className="w-full">View Collection</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button className="w-full mt-4">Create New Collection</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
