'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Moon, Sun, Bell, Lock } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    darkMode: false,
    notifications: true,
    emailNotifications: true,
  })

  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Full Name</label>
                  <Input
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="bg-input border border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="bg-input border border-border"
                  />
                </div>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>

            {/* Password */}
            <Card className="border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Current Password</label>
                  <Input type="password" placeholder="••••••••" className="bg-input border border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">New Password</label>
                  <Input type="password" placeholder="••••••••" className="bg-input border border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Confirm Password</label>
                  <Input type="password" placeholder="••••••••" className="bg-input border border-border" />
                </div>
                <Button className="gap-2">Update Password</Button>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified about your study reminders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="w-5 h-5 rounded border-border"
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-5 h-5 rounded border-border"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Preferences Sidebar */}
          <div className="space-y-6">
            {/* Appearance */}
            <Card className="border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                  <Sun className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-foreground">Light Mode</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                  <Moon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">Dark Mode</span>
                </button>
              </div>
            </Card>

            {/* Account Status */}
            <Card className="border border-border p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold text-foreground mb-2">Account Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-primary">Pro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Requests</span>
                  <span className="font-semibold text-foreground">156 / 500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-semibold text-foreground">2.4 / 10 GB</span>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Upgrade Plan
                </Button>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border border-destructive/50 p-6">
              <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
              <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/5">
                Delete Account
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
