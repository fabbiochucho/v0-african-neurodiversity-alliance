'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function SettingsPage() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    theme: 'light',
    language: 'en',
    dataSharing: false,
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>

        <Tabs defaultValue="notifications" className="max-w-2xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified on your devices</p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive text message alerts</p>
                  </div>
                  <Switch
                    checked={preferences.smsAlerts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, smsAlerts: checked })}
                  />
                </div>

                <div className="pt-4 border-t">
                  <p className="font-medium mb-3">Notification Categories</p>
                  <div className="space-y-2">
                    {['Community responses', 'Course updates', 'Resource recommendations', 'Advocacy campaigns'].map(
                      (category) => (
                        <div key={category} className="flex items-center">
                          <input type="checkbox" id={category} className="mr-2" defaultChecked />
                          <Label htmlFor={category} className="cursor-pointer">
                            {category}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <Button className="w-full">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your data and visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Allow others to find your profile</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Assessment Results</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your results</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Data for Research</Label>
                    <p className="text-sm text-muted-foreground">Help improve ANDA with anonymized data</p>
                  </div>
                  <Switch
                    checked={preferences.dataSharing}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, dataSharing: checked })}
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Icons.Download className="mr-2 h-4 w-4" />
                    Download Your Data
                  </Button>
                </div>

                <div>
                  <Button variant="outline" className="w-full">
                    <Icons.Trash className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </div>

                <Button className="w-full">Save Privacy Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="space-y-2">
                    {['Light', 'Dark', 'Auto'].map((theme) => (
                      <div key={theme} className="flex items-center">
                        <input
                          type="radio"
                          id={theme.toLowerCase()}
                          name="theme"
                          className="mr-2"
                          defaultChecked={theme === 'Light'}
                        />
                        <Label htmlFor={theme.toLowerCase()} className="cursor-pointer">
                          {theme}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Language</Label>
                  <div className="space-y-2">
                    {['English', 'Swahili', 'French', 'Arabic'].map((lang) => (
                      <div key={lang} className="flex items-center">
                        <input
                          type="radio"
                          id={lang.toLowerCase()}
                          name="language"
                          className="mr-2"
                          defaultChecked={lang === 'English'}
                        />
                        <Label htmlFor={lang.toLowerCase()} className="cursor-pointer">
                          {lang}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">Save Appearance</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
