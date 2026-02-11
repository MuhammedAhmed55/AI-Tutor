'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Moon, Sun, Bell, Lock, Loader2, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { supabase } from '@/lib/supabase/supabase-auth-client'
import { toast } from 'sonner'
import { usersService } from '@/modules/users/services/users-service'
import ChangePassword from '@/components/dashboard/user/component/change-password'

export default function SettingsPage() {
  const { userProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    notifications: false,
    emailNotifications: false,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabaseClient = supabase()
        const { data: { user } } = await supabaseClient.auth.getUser()

        if (user && userProfile) {
          setSettings({
            firstName: userProfile.first_name || '',
            lastName: userProfile.last_name || '',
            email: user.email || '',
            notifications: false,
            emailNotifications: false,
          })
        }
      } catch (err) {
        console.error('Error loading user data:', err)
        toast.error('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [userProfile])

  const handleSaveProfile = async () => {
    if (!userProfile?.id) {
      toast.error('User ID is missing')
      return
    }

    setSaving(true)
    try {
      await usersService.updateUser({
        id: userProfile.id,
        first_name: settings.firstName,
        last_name: settings.lastName,
        full_name: `${settings.firstName} ${settings.lastName}`,
      })
      toast.success('✅ Profile updated successfully')
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action cannot be undone. Your account and all data will be permanently deleted.')) {
      return
    }

    setSaving(true)
    try {
      const supabaseClient = supabase()
      const { data: { user } } = await supabaseClient.auth.getUser()

      if (user) {
        // Delete user profile first
        await usersService.deleteUser(user.id)
        
        // Sign out
        await supabaseClient.auth.signOut()
        
        toast.success('Account deleted successfully')
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Error deleting account:', err)
      toast.error('Failed to delete account')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">First Name</label>
                    <Input
                      value={settings.firstName}
                      onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                      className="bg-input border border-border"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Last Name</label>
                    <Input
                      value={settings.lastName}
                      onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                      className="bg-input border border-border"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={settings.email}
                    disabled
                    className="bg-muted/50 border border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Email cannot be changed. Contact support for assistance.</p>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
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
                <p className="text-sm text-muted-foreground">
                  Secure your account by regularly changing your password
                </p>
                <Button 
                  onClick={() => setChangePasswordOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
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
                    className="w-5 h-5 rounded cursor-pointer"
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
                    className="w-5 h-5 rounded cursor-pointer"
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
                <button 
                  onClick={() => setTheme('light')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/10' 
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <Sun className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-foreground">Light Mode</span>
                  {theme === 'light' && <span className="ml-auto text-xs font-semibold text-primary">✓ Active</span>}
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/10' 
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <Moon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">Dark Mode</span>
                  {theme === 'dark' && <span className="ml-auto text-xs font-semibold text-primary">✓ Active</span>}
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    theme === 'system' 
                      ? 'border-primary bg-primary/10' 
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <Monitor className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-foreground">System</span>
                  {theme === 'system' && <span className="ml-auto text-xs font-semibold text-primary">✓ Active</span>}
                </button>
              </div>
            </Card>

            {/* Account Status */}
            <Card className="border border-border p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold text-foreground mb-2">Account Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-primary">Free</span>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Upgrade Plan
                </Button>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border border-destructive/50 p-6">
              <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-destructive text-destructive hover:bg-destructive/5"
                onClick={handleDeleteAccount}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete Account'}
              </Button>
            </Card>
          </div>
        </div>
      </main>

      {/* Change Password Dialog */}
      {userProfile?.id && (
        <ChangePassword
          open={changePasswordOpen}
          onOpenChange={setChangePasswordOpen}
          userId={userProfile.id}
        />
      )}
    </div>
  )
}
