'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Icons } from '@/lib/icons'
import { useState } from 'react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    fullName: 'Jane Doe',
    email: 'jane.doe@anda.africa',
    userType: 'Parent/Caregiver',
    country: 'Kenya',
    language: 'English',
    bio: 'Supporting my neurodivergent child on their journey',
    phone: '+254 702 123456',
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'default' : 'outline'}>
            {isEditing ? (
              <>
                <Icons.Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Icons.Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Avatar and Basic Info */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                {isEditing && <Button variant="outline" size="sm">Change Picture</Button>}
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userType">User Type</Label>
                  <Input
                    id="userType"
                    value={profile.userType}
                    onChange={(e) => setProfile({ ...profile, userType: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <Input
                    id="language"
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bio</CardTitle>
            <CardDescription>Tell others about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              className="w-full p-3 border rounded-lg min-h-24 disabled:bg-gray-50"
              placeholder="Share your story..."
            />
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Active Sessions</p>
                <p className="text-sm text-muted-foreground">Manage devices with access</p>
              </div>
              <Button variant="outline">View Sessions</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">Delete Account</Button>
            <p className="text-xs text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
