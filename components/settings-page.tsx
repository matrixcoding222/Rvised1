"use client"

import { useState } from "react"
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
  User,
  Brain,
  SettingsIcon,
  CreditCard,
  Plug,
  Shield,
  Upload,
  Trash2,
  ExternalLink,
  Download,
} from "lucide-react"

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "learning", label: "Learning Preferences", icon: Brain },
  { id: "account", label: "Account", icon: SettingsIcon },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "privacy", label: "Data & Privacy", icon: Shield },
]

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const [hasChanges, setHasChanges] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Profile</h2>
              <p className="text-muted-foreground">Manage your personal information and preferences.</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" />
                      <AvatarFallback className="text-lg">JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" defaultValue="John Doe" className="mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue="john@example.com" disabled className="mt-1" />
                      <p className="text-sm text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself and your learning goals..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "learning":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Customize Your Learning</h2>
              <p className="text-muted-foreground">Personalize how Rvised creates summaries for you.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Summary Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Default Summary Mode</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="default" size="sm">
                      Student
                    </Button>
                    <Button variant="outline" size="sm">
                      Builder
                    </Button>
                    <Button variant="outline" size="sm">
                      Understand
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Summary Length</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      Quick
                    </Button>
                    <Button variant="default" size="sm">
                      Standard
                    </Button>
                    <Button variant="outline" size="sm">
                      Detailed
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">Include in Summaries</Label>
                  <div className="space-y-3">
                    {[
                      { id: "timestamps", label: "Timestamps", checked: true },
                      { id: "takeaways", label: "Key takeaways", checked: true },
                      { id: "actions", label: "Action items", checked: true },
                      { id: "quiz", label: "Quiz questions", checked: false },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Switch id={item.id} defaultChecked={item.checked} />
                        <Label htmlFor={item.id}>{item.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "digest", label: "Weekly learning digest", checked: false },
                    { id: "streak", label: "Streak reminders", checked: false },
                    { id: "features", label: "New features", checked: true },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Switch id={item.id} defaultChecked={item.checked} />
                      <Label htmlFor={item.id}>{item.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Account Settings</h2>
              <p className="text-muted-foreground">Manage your account security and preferences.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-sm font-semibold">
                      G
                    </div>
                    <div>
                      <p className="font-medium">Google</p>
                      <p className="text-sm text-muted-foreground">john@example.com</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" className="gap-2">
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
              <h2 className="text-2xl font-semibold mb-2">Subscription & Billing</h2>
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
                      <h3 className="font-semibold">Free Plan</h3>
                      <p className="text-sm text-muted-foreground">5 summaries per day</p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">Upgrade to Pro</Button>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Usage this month</span>
                      <span>47/150 summaries</span>
                    </div>
                    <Progress value={31} className="h-2" />
                  </div>
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
                  <p>No billing history yet</p>
                  <p className="text-sm">Upgrade to Pro to see your invoices here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "integrations":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Connect Your Tools</h2>
              <p className="text-muted-foreground">Integrate Rvised with your favorite productivity apps.</p>
            </div>

            <div className="grid gap-4">
              {[
                { name: "Notion", description: "Export summaries automatically", icon: "📝", connected: false },
                { name: "Obsidian", description: "Sync your knowledge graph", icon: "🔗", connected: false },
                { name: "Google Drive", description: "Backup summaries", icon: "📁", connected: true },
              ].map((integration) => (
                <Card key={integration.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      {integration.connected ? (
                        <Badge variant="secondary" className="gap-1">
                          Connected
                        </Badge>
                      ) : (
                        <Button variant="outline" className="gap-2 bg-transparent">
                          <ExternalLink className="h-4 w-4" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Your Data</h2>
              <p className="text-muted-foreground">Control how your data is used and stored.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-muted-foreground">Download all your summaries, projects, and settings</p>
                  </div>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Download Everything
                  </Button>
                </div>
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Share Summaries Publicly</Label>
                    <p className="text-sm text-muted-foreground">Allow others to discover your summaries</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="retention">Data Retention</Label>
                  <Select defaultValue="forever">
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forever">Keep forever</SelectItem>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="6months">6 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-muted-foreground">Free up storage space</p>
                  </div>
                  <Button variant="outline">Clear</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="justify-start p-0 h-auto gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Privacy Policy
                </Button>
                <Button variant="ghost" className="justify-start p-0 h-auto gap-2">
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-60 shrink-0">
            <div className="sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">Settings</h1>
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeSection === item.id
                          ? "bg-primary/10 text-primary font-medium"
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
    </div>
  )
}
