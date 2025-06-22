"use client"

import { Textarea } from "@/components/ui/textarea"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Gift, IndianRupee } from "lucide-react"

interface Booking {
  id: number
  trek_date: string
  total_participants: number
  total_amount: number
  status: string
  created_at: string
  treks: {
    title: string
    duration: string
    difficulty: string
  }
}

interface Voucher {
  id: number
  code: string
  discount_percentage: number | null
  discount_amount: number | null
  valid_until: string | null
  is_used: boolean
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin?redirect=/dashboard")
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch bookings with trek details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          treks (
            title,
            duration,
            difficulty
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (bookingsError) throw bookingsError

      // Fetch vouchers
      const { data: vouchersData, error: vouchersError } = await supabase
        .from("vouchers")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (vouchersError) throw vouchersError

      setBookings(bookingsData || [])
      setVouchers(vouchersData || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const upcomingBookings = bookings.filter((b) => b.status !== "cancelled" && new Date(b.trek_date) >= new Date())

  const pastBookings = bookings.filter((b) => b.status === "confirmed" && new Date(b.trek_date) < new Date())

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.user_metadata?.full_name || user.email}</p>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="history">Trek History</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Treks</h2>
              {upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{booking.treks.title}</CardTitle>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        </div>
                        <CardDescription>
                          {booking.treks.duration} • {booking.treks.difficulty}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(booking.trek_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{booking.total_participants} participants</span>
                          </div>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-2" />
                            <span>{booking.total_amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming treks</h3>
                    <p className="text-muted-foreground">Book your next adventure to see it here!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Trek History</h2>
            {pastBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{booking.treks.title}</CardTitle>
                      <CardDescription>
                        {booking.treks.duration} • {booking.treks.difficulty}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Completed on {new Date(booking.trek_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{booking.total_participants} participants</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No completed treks</h3>
                  <p className="text-muted-foreground">Your trek history will appear here after completion.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vouchers" className="mt-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">My Vouchers</h2>
            {vouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vouchers.map((voucher) => (
                  <Card key={voucher.id} className={voucher.is_used ? "opacity-50" : ""}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-mono">{voucher.code}</CardTitle>
                        <Badge variant={voucher.is_used ? "secondary" : "default"}>
                          {voucher.is_used ? "Used" : "Available"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          {voucher.discount_percentage
                            ? `${voucher.discount_percentage}% OFF`
                            : `₹${voucher.discount_amount} OFF`}
                        </div>
                        {voucher.valid_until && (
                          <p className="text-sm text-muted-foreground">
                            Valid until {new Date(voucher.valid_until).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No vouchers available</h3>
                  <p className="text-muted-foreground">Vouchers and discounts will appear here when available.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileSection() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") throw error

      setProfile(
        data || {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          phone_number: "",
          address: "",
          avatar_url: "",
        },
      )
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: profile.email,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        address: profile.address,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      setEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Profile</h2>
        {editing ? (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={profile?.phone_number || ""}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile?.address || ""}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!editing}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
