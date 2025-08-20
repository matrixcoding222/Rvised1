"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useClerk, useUser } from "@clerk/nextjs"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  User,
  Brain,
  Settings,
  CreditCard,
  Shield,
  Upload,
  Trash2,
  ExternalLink,
  LogOut,
  Check,
  AlertTriangle,
  ArrowLeft,
  Crown,
} from "lucide-react"

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "learning", label: "Learning Preferences", icon: Brain },
  { id: "account", label: "Account", icon: Settings },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "privacy", label: "Data & Privacy", icon: Shield },
]

export function SettingsPage() {
  const router = useRouter()
  const { signOut } = useClerk()
  const { user } = useUser()
  const [activeSection, setActiveSection] = useState("profile")
  const [hasChanges, setHasChanges] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedNotification, setSavedNotification] = useState(false)
  
  // Learning preferences state
  const [learningMode, setLearningMode] = useState("student")
  const [summaryLength, setSummaryLength] = useState("standard")
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)
  
  // Profile state
  const [displayName, setDisplayName] = useState(user?.fullName || "")
  const [bio, setBio] = useState("")
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [promoMessage, setPromoMessage] = useState("")
  const [promoSuccess, setPromoSuccess] = useState(false)

  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem("learningPreferences")
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      setLearningMode(prefs.learningMode || "student")
      setSummaryLength(prefs.summaryLength || "standard")
      setIncludeTimestamps(prefs.includeTimestamps ?? true)
      setIncludeEmojis(prefs.includeEmojis ?? true)
    }
  }, [])

  const saveLearningPreferences = () => {
    setIsSaving(true)
    const preferences = {
      learningMode,
      summaryLength,
      includeTimestamps,
      includeEmojis,
    }
    localStorage.setItem("learningPreferences", JSON.stringify(preferences))
    
    setTimeout(() => {
      setIsSaving(false)
      setSavedNotification(true)
      setTimeout(() => setSavedNotification(false), 3000)
    }, 500)
  }

  const handlePromoCode = async () => {
    setIsApplyingPromo(true)
    setPromoMessage("")
    
    try {
      const response = await fetch("/api/promo-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: promoCode,
          email: user?.primaryEmailAddress?.emailAddress 
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setPromoSuccess(true)
        setPromoMessage("🎉 Promo code applied successfully! You now have Pro access.")
        setPromoCode("")
        // Refresh the page to update the UI
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setPromoSuccess(false)
        setPromoMessage(data.error || "Invalid promo code")
      }
    } catch (error) {
      setPromoSuccess(false)
      setPromoMessage("Failed to apply promo code. Please try again.")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(() => router.push("/"))
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return
    
    setIsDeleting(true)
    try {
      // In a real app, you'd call an API to delete the account
      await user?.delete()
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      setIsDeleting(false)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Profile</h2>
              <p className="text-muted-foreground">Manage your personal information and preferences.</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                      <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value)
                          setHasChanges(true)
                        }}
                        className="mt-1" 
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.primaryEmailAddress?.emailAddress || ""} 
                        disabled 
                        className="mt-1 bg-gray-50" 
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Email is managed through your Google account
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => {
                          setBio(e.target.value)
                          setHasChanges(true)
                        }}
                        placeholder="Tell us about yourself and your learning goals..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      disabled={!hasChanges || isSaving}
                      onClick={() => {
                        setIsSaving(true)
                        setTimeout(() => {
                          setIsSaving(false)
                          setHasChanges(false)
                          setSavedNotification(true)
                          setTimeout(() => setSavedNotification(false), 3000)
                        }, 500)
                      }}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    {savedNotification && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Saved successfully</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case "learning":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Customize Your Learning</h2>
              <p className="text-muted-foreground">Personalize how Rvised creates summaries for you.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Summary Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">Default Summary Mode</Label>
                  <div className="flex gap-2">
                    {["student", "builder", "deep"].map((mode) => (
                      <Button
                        key={mode}
                        variant={learningMode === mode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLearningMode(mode)}
                        className={learningMode === mode ? "bg-primary hover:bg-primary/90" : ""}
                      >
                        {mode === "student" ? "📚 Student" : mode === "builder" ? "🔨 Builder" : "🧠 Deep"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">Summary Length</Label>
                  <div className="flex gap-2">
                    {["quick", "standard", "detailed"].map((length) => (
                      <Button
                        key={length}
                        variant={summaryLength === length ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSummaryLength(length)}
                        className={summaryLength === length ? "bg-primary hover:bg-primary/90" : ""}
                      >
                        {length === "quick" ? "⚡ Quick" : length === "standard" ? "📖 Standard" : "🔍 Detailed"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">Include in Summaries</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="timestamps" 
                        checked={includeTimestamps}
                        onCheckedChange={setIncludeTimestamps}
                      />
                      <Label htmlFor="timestamps" className="cursor-pointer">
                        <span className="font-medium">Timestamps</span>
                        <p className="text-sm text-muted-foreground">Show video timestamps for each section</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="emojis" 
                        checked={includeEmojis}
                        onCheckedChange={setIncludeEmojis}
                      />
                      <Label htmlFor="emojis" className="cursor-pointer">
                        <span className="font-medium">Emojis</span>
                        <p className="text-sm text-muted-foreground">Add visual indicators to summaries</p>
                      </Label>
                    </div>
                  </div>
                </div>

                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={saveLearningPreferences}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
                {savedNotification && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Preferences saved</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
              <p className="text-muted-foreground">Manage your account security and preferences.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      G
                    </div>
                    <div>
                      <p className="font-medium">Google Account</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Connected</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your account security is managed through Google authentication. 
                  All authentication and security features are handled by your Google account.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sign Out</p>
                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="gap-2 border-red-300 text-red-600 hover:bg-red-100"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="gap-2"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "billing":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Subscription & Billing</h2>
              <p className="text-muted-foreground">Manage your subscription and billing information.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Free Plan</h3>
                      <p className="text-sm text-muted-foreground">3 summaries per day</p>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
                      onClick={() => router.push("/dashboard/upgrade")}
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Usage today</span>
                      <span className="font-semibold">2/3 summaries</span>
                    </div>
                    <Progress value={66} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">Resets daily at midnight</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Crown className="h-4 w-4 text-blue-600" />
                      Pro Benefits
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        Unlimited summaries
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        Videos of any length
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-600" />
                        Priority processing
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Have a promo code? Enter it below to unlock Pro features.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="font-mono"
                      maxLength={20}
                    />
                    <Button 
                      onClick={handlePromoCode}
                      disabled={isApplyingPromo || !promoCode}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isApplyingPromo ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                  {promoMessage && (
                    <div className={`text-sm ${promoSuccess ? 'text-green-600' : 'text-red-600'}`}>
                      {promoMessage}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No billing history yet</p>
                  <p className="text-sm mt-1">Upgrade to Pro to see your invoices here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )


      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Data</h2>
              <p className="text-muted-foreground">Control how your data is used and stored.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your summaries and projects are stored securely in our database. 
                  Data export features are coming soon.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Anonymous Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help us improve Rvised</p>
                  </div>
                  <Switch defaultChecked />
                </div>



                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-muted-foreground">Free up storage space</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      localStorage.clear()
                      setSavedNotification(true)
                      setTimeout(() => setSavedNotification(false), 3000)
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="justify-start p-0 h-auto gap-2 text-blue-600 hover:text-blue-700"
                  onClick={() => window.open("/privacy", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Privacy Policy
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start p-0 h-auto gap-2 text-blue-600 hover:text-blue-700"
                  onClick={() => window.open("/terms", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Terms of Service
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Image src="/glasses.svg" alt="Rvised" width={24} height={24} />
                <span className="font-semibold">Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-60 shrink-0">
            <div className="sticky top-8">
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-all ${
                        activeSection === item.id
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-primary font-medium border-l-4 border-primary"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">{renderContent()}</div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="pt-3 space-y-3">
              <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
              <p className="font-semibold">Type DELETE to confirm:</p>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="mt-3"
          />
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteConfirmText("")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}