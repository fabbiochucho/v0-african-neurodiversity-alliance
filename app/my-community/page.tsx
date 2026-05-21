'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import Link from 'next/link'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MyCommunityPage() {
  const [following] = useState([
    { id: 1, name: 'ADHD Support Group', members: 234, category: 'ADHD' },
    { id: 2, name: 'Autism Spectrum Community', members: 567, category: 'Autism' },
    { id: 3, name: 'Parent Support Network', members: 345, category: 'Parents' },
  ])

  const [myPosts] = useState([
    {
      id: 1,
      title: 'Tips for Managing ADHD at Work',
      category: 'ADHD Support Group',
      likes: 45,
      replies: 12,
      date: '2 days ago',
    },
    {
      id: 2,
      title: 'Accommodations that helped me succeed in school',
      category: 'Autism Spectrum Community',
      likes: 78,
      replies: 23,
      date: '1 week ago',
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Community</h1>
            <p className="text-muted-foreground text-lg">Manage your groups and discussions</p>
          </div>
          <Button asChild>
            <Link href="/community">
              <Icons.Plus className="mr-2 h-4 w-4" />
              Browse Groups
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="groups" className="mb-8">
          <TabsList>
            <TabsTrigger value="groups">Groups ({following.length})</TabsTrigger>
            <TabsTrigger value="posts">My Posts ({myPosts.length})</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
          </TabsList>

          {/* Groups */}
          <TabsContent value="groups" className="mt-6">
            <div className="space-y-4">
              {following.map((group) => (
                <Card key={group.id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-2">{group.name}</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            <Icons.Users className="h-4 w-4 inline mr-1" />
                            {group.members} members
                          </span>
                          <span className="text-sm px-2 py-1 bg-accent/50 rounded">{group.category}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild>
                          <Link href={`/community/${group.id}`}>
                            <Icons.MessageSquare className="mr-2 h-4 w-4" />
                            View Group
                          </Link>
                        </Button>
                        <Button variant="outline">
                          <Icons.Unfollow className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Posts */}
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-4">
              {myPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Posted in <span className="font-medium">{post.category}</span> • {post.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icons.Heart className="h-4 w-4" />
                        {post.likes} likes
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icons.MessageCircle className="h-4 w-4" />
                        {post.replies} replies
                      </div>
                      <Button asChild variant="ghost" size="sm" className="ml-auto">
                        <Link href={`/community/${post.id}`}>View Post</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookmarks */}
          <TabsContent value="bookmarks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookmarked Discussions</CardTitle>
                <CardDescription>Discussions you saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Icons.Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't bookmarked any discussions yet</p>
                  <Button asChild>
                    <Link href="/community">Explore Community</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Community Activity</CardTitle>
            <CardDescription>Recent activity from groups you follow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'reply', text: 'Sarah replied to your post', time: '30 mins ago' },
                { type: 'like', text: 'John and 5 others liked your post', time: '2 hours ago' },
                { type: 'mention', text: 'Emily mentioned you in ADHD Support Group', time: '5 hours ago' },
                { type: 'new', text: 'New discussion: Workplace Accommodations in Autism Spectrum Community', time: '1 day ago' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <div className="flex-shrink-0">
                    {activity.type === 'reply' && <Icons.MessageSquare className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'like' && <Icons.Heart className="h-5 w-5 text-red-600" />}
                    {activity.type === 'mention' && <Icons.AtSign className="h-5 w-5 text-orange-600" />}
                    {activity.type === 'new' && <Icons.Sparkles className="h-5 w-5 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
