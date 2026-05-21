'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import Link from 'next/link'
import { useState } from 'react'

export default function IEPDashboardPage() {
  const [ieps] = useState([
    {
      id: 1,
      title: 'ADHD Support Plan 2026',
      created: '2026-01-15',
      updated: '2026-05-18',
      status: 'Active',
      goals: 5,
      progressPercentage: 65,
    },
    {
      id: 2,
      title: 'Learning Support - Dyslexia',
      created: '2025-09-10',
      updated: '2026-04-20',
      status: 'Active',
      goals: 4,
      progressPercentage: 45,
    },
    {
      id: 3,
      title: 'Social Skills Development',
      created: '2025-06-01',
      updated: '2026-02-14',
      status: 'Archived',
      goals: 3,
      progressPercentage: 100,
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My IEPs</h1>
            <p className="text-muted-foreground text-lg">Manage your Individualized Education Plans</p>
          </div>
          <Button asChild className="text-lg px-6">
            <Link href="/iep/generate">
              <Icons.Plus className="mr-2 h-5 w-5" />
              Create New IEP
            </Link>
          </Button>
        </div>

        {/* IEP List */}
        <div className="space-y-4">
          {ieps.map((iep) => (
            <Card key={iep.id} className="hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{iep.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        iep.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {iep.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Created {new Date(iep.created).toLocaleDateString()} • Updated {new Date(iep.updated).toLocaleDateString()}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Progress</p>
                        <p className="text-sm font-medium">{iep.progressPercentage}%</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all" 
                          style={{ width: `${iep.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Goals Info */}
                    <p className="text-sm text-muted-foreground mb-4">{iep.goals} goals • Last updated: {new Date(iep.updated).toLocaleDateString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/iep/${iep.id}`}>
                        <Icons.Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icons.Download className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {ieps.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Icons.FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No IEPs yet</h3>
              <p className="text-muted-foreground mb-6">Create your first Individualized Education Plan</p>
              <Button asChild>
                <Link href="/iep/generate">Create IEP</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total IEPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ieps.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active IEPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ieps.filter(i => i.status === 'Active').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(ieps.reduce((sum, iep) => sum + iep.progressPercentage, 0) / ieps.length)}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
