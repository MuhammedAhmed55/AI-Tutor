'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, BookOpen, Zap, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default function userDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, John</h1>
          <p className="text-muted-foreground">Here's what's happening with your studies today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-sm text-muted-foreground font-medium mb-1">Documents Uploaded</h3>
            <p className="text-2xl font-bold text-foreground">24</p>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-accent/10 rounded-lg p-3">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
            </div>
            <h3 className="text-sm text-muted-foreground font-medium mb-1">AI Requests Used</h3>
            <p className="text-2xl font-bold text-foreground">156 / 500</p>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-600/10 rounded-lg p-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
            </div>
            <h3 className="text-sm text-muted-foreground font-medium mb-1">Study Streaks</h3>
            <p className="text-2xl font-bold text-foreground">7 days</p>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-600/10 rounded-lg p-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">-3%</span>
            </div>
            <h3 className="text-sm text-muted-foreground font-medium mb-1">Time Studied</h3>
            <p className="text-2xl font-bold text-foreground">24.5 hrs</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Uploads */}
          <div className="lg:col-span-2">
            <Card className="border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Recent Uploads</h2>
                <Link href="/dashboard/upload">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Biology Chapter 5 Notes', date: '2 hours ago', size: '2.4 MB' },
                  { name: 'Chemistry Formula Sheet', date: 'Yesterday', size: '1.8 MB' },
                  { name: 'Physics Questions', date: '3 days ago', size: '3.2 MB' }
                ].map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div>
                      <p className="font-medium text-foreground text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="border border-border p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/dashboard/upload">
                  <Button className="w-full gap-2 justify-start" variant="default">
                    <Plus className="w-4 h-4" />
                    Upload Notes
                  </Button>
                </Link>
                <Link href="/dashboard/tools">
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <Zap className="w-4 h-4" />
                    Generate Summary
                  </Button>
                </Link>
                <Link href="/dashboard/study-plan">
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <BookOpen className="w-4 h-4" />
                    Create Study Plan
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="border border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">Usage This Month</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                    <span>AI Requests</span>
                    <span>156 / 500</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '31%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                    <span>Storage</span>
                    <span>2.4 / 10 GB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
