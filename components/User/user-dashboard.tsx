'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, BookOpen, Zap, Clock, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase-auth-client'

interface DashboardStats {
  totalDocuments: number
  aiRequestsUsed: number
  aiRequestsLimit: number
  studyStreaks: number
  timeStudied: number
  recentUploads: Array<{
    id: string
    file_name: string
    upload_date: string
    file_size: number
  }>
  storageUsed: number
  storageLimit: number
  userName: string
}

export default function userDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabaseClient = supabase()
      const { data: { user } } = await supabaseClient.auth.getUser()

      if (!user) return

      // Fetch user profile
      const { data: userProfile } = await supabaseClient
        .from('user_profile')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single()

      // Fetch recent uploads (last 3)
      const { data: uploads } = await supabaseClient
        .from('pdf_notes')
        .select('id, file_name, upload_date, file_size')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false })
        .limit(3)

      // Fetch all documents count
      const { count: totalDocuments } = await supabaseClient
        .from('pdf_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Fetch AI summaries count (as proxy for AI requests)
      const { count: aiRequestsUsed } = await supabaseClient
        .from('ai_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Calculate total storage used (in bytes first, then convert to GB)
      const { data: allUploads } = await supabaseClient
        .from('pdf_notes')
        .select('file_size')
        .eq('user_id', user.id)

      const storageUsedBytes = allUploads?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0
      const storageUsedGB = storageUsedBytes / (1024 * 1024 * 1024)

      // Format recent uploads with relative time
      const formattedUploads = (uploads || []).map(file => {
        const uploadDate = new Date(file.upload_date)
        const now = new Date()
        const diffMs = now.getTime() - uploadDate.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        let relativeTime = ''
        if (diffMins < 60) {
          relativeTime = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
        } else if (diffHours < 24) {
          relativeTime = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
        } else if (diffDays === 1) {
          relativeTime = 'Yesterday'
        } else if (diffDays < 7) {
          relativeTime = `${diffDays} days ago`
        } else {
          relativeTime = uploadDate.toLocaleDateString()
        }

        return {
          ...file,
          relativeTime,
          fileSizeMB: (file.file_size / (1024 * 1024)).toFixed(1)
        }
      })

      setStats({
        totalDocuments: totalDocuments || 0,
        aiRequestsUsed: aiRequestsUsed || 0,
        aiRequestsLimit: 500,
        studyStreaks: 0, // Could be calculated from study_sessions table if available
        timeStudied: 0, // Could be calculated from study_sessions table if available
        recentUploads: formattedUploads,
        storageUsed: Math.round(storageUsedGB * 10) / 10,
        storageLimit: 10,
        userName: userProfile?.first_name || 'User'
      })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const aiRequestsPercentage = (stats.aiRequestsUsed / stats.aiRequestsLimit) * 100
  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {stats.userName}</h1>
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
            <p className="text-2xl font-bold text-foreground">{stats.totalDocuments}</p>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-accent/10 rounded-lg p-3">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
            </div>
            <h3 className="text-sm text-muted-foreground font-medium mb-1">AI Requests Used</h3>
            <p className="text-2xl font-bold text-foreground">{stats.aiRequestsUsed} / {stats.aiRequestsLimit}</p>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-600/10 rounded-lg p-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
            </div>
            <h3 className="text-sm text-muted-foreground font-medium mb-1">Study Streaks</h3>
            <p className="text-2xl font-bold text-foreground">{stats.studyStreaks} days</p>
          </Card>

          <Card className="p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-600/10 rounded-lg p-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">-3%</span>
            </div>
            <h3 className="text-sm text-muted-foreground font-medium mb-1">Time Studied</h3>
            <p className="text-2xl font-bold text-foreground">{stats.timeStudied} hrs</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Uploads */}
          <div className="lg:col-span-2">
            <Card className="border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Recent Uploads</h2>
                <Link href="/user-dashboard/upload">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recentUploads.length > 0 ? (
                  stats.recentUploads.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors">
                      <div>
                        <p className="font-medium text-foreground text-sm">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">{file.relativeTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-muted-foreground">{file.fileSizeMB} MB</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="border border-border p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/user-dashboard/upload">
                  <Button className="w-full gap-2 justify-start" variant="default">
                    <Plus className="w-4 h-4" />
                    Upload Notes
                  </Button>
                </Link>
                <Link href="/user-dashboard/tools">
                  <Button className="w-full gap-2 justify-start" variant="outline">
                    <Zap className="w-4 h-4" />
                    Generate Summary
                  </Button>
                </Link>
                <Link href="/user-dashboard/study-plan">
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
                    <span>{stats.aiRequestsUsed} / {stats.aiRequestsLimit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(aiRequestsPercentage, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs text-muted-foreground">
                    <span>Storage</span>
                    <span>{stats.storageUsed} / {stats.storageLimit} GB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${Math.min(storagePercentage, 100)}%` }}></div>
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
