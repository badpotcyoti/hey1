"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Minus, IndianRupee } from "lucide-react"
import Link from "next/link"

interface Trek {
  id: number
  title: string
  price: number | null
  duration: string | null
  difficulty: string | null
}

interface Participant {
  name: string
  email: string
  phone_number: string
  address: string
  is_primary_user: boolean
}

export default function BookTrekPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [trek, setTrek] = useState<Trek | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [participantCount, setParticipantCount] = useState(1)
  const [trekDate, setTrekDate] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    if (!user) {
      router.push(`/auth/signin?redirect=/trek/${params.id}/book`)
      return
    }

    async function fetchTrek() {
      try {
        const { data, error } = await supabase
          .from("treks")
          .select("id, title, price, duration, difficulty")
          .eq("id", params.id)
          .single()

        if (error) throw error
        setTrek(data)

        // Initialize with primary user data
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email, phone_number, address")
          .eq("id", user.id)
          .single()

        setParticipants([
          {
            name: profile?.full_name || "",
            email: profile?.email || user.email || "",
            phone_number: profile?.phone_number || "",
            address: profile?.address || "",
            is_primary_user: true,
          },
        ])
      } catch (error) {
        console.error("Error fetching trek:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchTrek()
  }, [params.id, user, router])

  useEffect(() => {
    // Adjust participants array when count changes
    if (participants.length < participantCount) {
      const newParticipants = [...participants]
      for (let i = participants.length; i < participantCount; i++) {
        newParticipants.push({
          name: "",
          email: "",
          phone_number: "",
          address: "",
          is_primary_user: false,
        })
      }
      setParticipants(newParticipants)
    } else if (participants.length > participantCount) {
      setParticipants(participants.slice(0, participantCount))
    }
  }, [participantCount, participants.length])

  const updateParticipant = (index: number, field: keyof Participant, value: string | boolean) => {
    const updated = [...participants]
    updated[index] = { ...updated[index], [field]: value }
    setParticipants(updated)
  }

  const handleBooking = async () => {
    if (!trek || !user || !trekDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate all participants have required fields
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i]
      if (!p.name || !p.email || !p.phone_number || !p.address) {
        toast({
          title: "Error",
          description: `Please fill in all details for participant ${i + 1}.`,
          variant: "destructive",
        })
        return
      }
    }

    setBooking(true)

    try {
      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          trek_id: trek.id,
          trek_date: trekDate,
          total_participants: participantCount,
          total_amount: (trek.price || 0) * participantCount,
          status: "pending",
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Add participants
      const participantInserts = participants.map((p) => ({
        booking_id: bookingData.id,
        name: p.name,
        email: p.email,
        phone_number: p.phone_number,
        address: p.address,
        is_primary_user: p.is_primary_user,
      }))

      const { error: participantError } = await supabase.from("participants").insert(participantInserts)

      if (participantError) throw participantError

      toast({
        title: "Booking Successful!",
        description: "Your trek has been booked successfully. Check your dashboard for details.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!trek) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Trek not found</h1>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  const totalAmount = (trek.price || 0) * participantCount

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Link
        href={`/trek/${params.id}`}
        className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Trek Details
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book Your Trek</CardTitle>
              <CardDescription>Fill in the details for all participants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trek Date */}
              <div className="space-y-2">
                <Label htmlFor="trek-date">Trek Date</Label>
                <Input
                  id="trek-date"
                  type="date"
                  value={trekDate}
                  onChange={(e) => setTrekDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              {/* Participant Count */}
              <div className="space-y-2">
                <Label>Number of Participants</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                    disabled={participantCount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-8 text-center">{participantCount}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setParticipantCount(participantCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Participants Details */}
              <div className="space-y-6">
                {participants.map((participant, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {index === 0 ? "Primary Participant (You)" : `Participant ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${index}`}>Full Name</Label>
                          <Input
                            id={`name-${index}`}
                            value={participant.name}
                            onChange={(e) => updateParticipant(index, "name", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`email-${index}`}>Email</Label>
                          <Input
                            id={`email-${index}`}
                            type="email"
                            value={participant.email}
                            onChange={(e) => updateParticipant(index, "email", e.target.value)}
                            disabled={index === 0}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                          <Input
                            id={`phone-${index}`}
                            value={participant.phone_number}
                            onChange={(e) => updateParticipant(index, "phone_number", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor={`address-${index}`}>Address</Label>
                          <Textarea
                            id={`address-${index}`}
                            value={participant.address}
                            onChange={(e) => updateParticipant(index, "address", e.target.value)}
                            rows={3}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{trek.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {trek.duration} • {trek.difficulty}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price per person</span>
                  <span className="flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {trek.price?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Participants</span>
                  <span>{participantCount}</span>
                </div>
                {trekDate && (
                  <div className="flex justify-between">
                    <span>Trek Date</span>
                    <span>{new Date(trekDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span className="flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  {totalAmount.toLocaleString()}
                </span>
              </div>

              <Button onClick={handleBooking} disabled={booking || !trekDate} className="w-full" size="lg">
                {booking ? "Processing..." : "Confirm Booking"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
