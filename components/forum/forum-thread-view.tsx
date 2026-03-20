import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, Reply, Flag, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  id: string
  content: string
  likes_count: number
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface Thread {
  id: string
  title: string
  content: string
  views: number
  replies_count: number
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export function ForumThreadView({
  thread,
  posts,
  onReply,
  onLike,
}: {
  thread: Thread
  posts: Post[]
  onReply: (content: string) => void
  onLike: (postId: string) => void
}) {
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  return (
    <div className="space-y-6">
      {/* Thread Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{thread.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {thread.profiles?.full_name}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
            </div>
            <Badge variant="outline">{thread.views} views</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground whitespace-pre-wrap">{thread.content}</p>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{posts.length} Replies</h3>
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>{post.profiles?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{post.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground mt-2 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLike(post.id)}
                      className="gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Flag className="h-4 w-4" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Box */}
      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your thoughts..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-24"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsReplying(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onReply(replyContent)
                setReplyContent('')
              }}
              disabled={!replyContent.trim()}
            >
              Post Reply
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
