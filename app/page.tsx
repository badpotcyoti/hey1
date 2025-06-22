"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, IndianRupee, Search } from "lucide-react"

interface Trek {
  id: number
  title: string
  description: string | null
  duration: string | null
  difficulty: string | null
  price: number | null
}

export default function HomePage() {
  const [treks, setTreks] = useState<Trek[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    let isMounted = true

    async function fetchTreks() {
      try {
        // Only fetch essential fields for better performance
        const { data, error } = await supabase
          .from("treks")
          .select("id, title, description, duration, difficulty, price")
          .limit(50) // Limit initial load
          .order("id", { ascending: true })

        if (error) throw error

        if (isMounted) {
          setTreks(data || [])
        }
      } catch (error) {
        console.error("Error fetching treks:", error)
        if (isMounted) {
          setTreks([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTreks()

    return () => {
      isMounted = false
    }
  }, [])

  // Memoized filtered treks for better performance
  const filteredTreks = useMemo(() => {
    if (!searchTerm) return treks
    return treks.filter(
      (trek) =>
        trek.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trek.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [treks, searchTerm])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Discover Amazing Treks</h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Embark on unforgettable adventures with our curated collection of treks.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search treks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Treks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTreks.map((trek) => (
          <TrekCard key={trek.id} trek={trek} />
        ))}
      </div>

      {filteredTreks.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">{searchTerm ? "No treks found" : "No treks available"}</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try a different search term" : "Check back later for new adventures!"}
          </p>
        </div>
      )}
    </div>
  )
}

// Memoized trek card component for better performance
const TrekCard = ({ trek }: { trek: Trek }) => {
  const difficultyColor =
    {
      Easy: "bg-green-100 text-green-800",
      "Easy to Moderate": "bg-blue-100 text-blue-800",
      Moderate: "bg-yellow-100 text-yellow-800",
      "Moderate to Difficult": "bg-orange-100 text-orange-800",
      Difficult: "bg-red-100 text-red-800",
      "Very Difficult": "bg-purple-100 text-purple-800",
    }[trek.difficulty || ""] || "bg-gray-100 text-gray-800"

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-32 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-1">🏔️</div>
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={`${difficultyColor} text-xs`}>{trek.difficulty}</Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{trek.title}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">{trek.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {trek.duration}
          </div>
          <div className="flex items-center font-semibold text-sm">
            <IndianRupee className="h-3 w-3" />
            {trek.price?.toLocaleString()}
          </div>
        </div>

        <Link href={`/trek/${trek.id}`}>
          <Button className="w-full" size="sm">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
