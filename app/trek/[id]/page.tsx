"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clock, IndianRupee, Star } from "lucide-react"

interface Trek {
  id: number
  title: string
  description: string | null
  duration: string | null
  difficulty: string | null
  price: number | null
  overview: string | null
  highlights: string[] | null
  who_can_participate: string | null
  itinerary: any | null
  how_to_reach: string | null
  cost_terms: string | null
  trek_essentials: string[] | null
}

export default function TrekDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [trek, setTrek] = useState<Trek | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchTrek() {
      try {
        const { data, error } = await supabase.from("treks").select("*").eq("id", params.id).single()

        if (error) throw error

        if (isMounted) {
          setTrek(data)
        }
      } catch (error) {
        console.error("Error fetching trek:", error)
        if (isMounted) {
          router.push("/")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (params.id) {
      fetchTrek()
    }

    return () => {
      isMounted = false
    }
  }, [params.id, router])

  const handleBookNow = () => {
    if (!user) {
      router.push(`/auth/signin?redirect=/trek/${params.id}/book`)
    } else {
      router.push(`/trek/${params.id}/book`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Treks
      </Link>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-6xl mb-4">🏔️</div>
            <div className="text-lg font-bold px-4">{trek.title}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{trek.title}</h1>
            <p className="text-muted-foreground">{trek.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{trek.duration}</span>
            </div>
            <Badge variant="outline">{trek.difficulty}</Badge>
            <div className="flex items-center font-semibold text-lg">
              <IndianRupee className="h-5 w-5" />
              {trek.price?.toLocaleString()}
            </div>
          </div>

          <Button onClick={handleBookNow} size="lg" className="w-full lg:w-auto">
            Book This Trek
          </Button>
        </div>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="highlights">Highlights</TabsTrigger>
          <TabsTrigger value="participation">Who Can Join</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="reach" className="hidden lg:block">
            How to Reach
          </TabsTrigger>
          <TabsTrigger value="terms" className="hidden lg:block">
            Cost Terms
          </TabsTrigger>
          <TabsTrigger value="essentials" className="hidden lg:block">
            Essentials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trek Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{trek.overview || "No overview available."}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="highlights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trek Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              {trek.highlights && trek.highlights.length > 0 ? (
                <ul className="space-y-2">
                  {trek.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No highlights available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Who Can Participate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {trek.who_can_participate || "No participation requirements specified."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itinerary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trek Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              {trek.itinerary ? (
                <div className="space-y-4">
                  {Object.entries(trek.itinerary).map(([day, activity]) => (
                    <div key={day} className="border-l-2 border-primary pl-4">
                      <h4 className="font-semibold capitalize">{day.replace(/([A-Z])/g, " $1").trim()}</h4>
                      <p className="text-muted-foreground">{activity as string}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No itinerary available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reach" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>How to Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {trek.how_to_reach || "No travel information available."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{trek.cost_terms || "No cost terms available."}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="essentials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trek Essentials</CardTitle>
            </CardHeader>
            <CardContent>
              {trek.trek_essentials && trek.trek_essentials.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {trek.trek_essentials.map((essential, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-2 w-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      <span>{essential}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No essentials list available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
