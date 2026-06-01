"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Star, Heart, MessageCircle, CheckCircle, Clock, Globe2, Award, Loader2, Share2, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"
import { RatingDistribution } from "@/components/astrologer/RatingDistribution"
import { OfferingCard } from "@/components/offering/OfferingCard"
import { cn, getInitials, formatDate } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/axios"

type Tab = "about" | "offerings" | "reviews"

interface Review {
  _id: string
  userId: {
    name: string
    avatar?: string
  }
  rating: number
  review: string
  createdAt: string
}

interface Astrologer {
  _id: string
  name: string
  displayName?: string
  avatar?: string
  coverPhoto?: string
  biography?: string
  aboutMe?: string
  skills: string[]
  expertise: string[]
  primaryExpertise?: string
  experience?: number
  languages: string[]
  rating: number
  totalRatings: number
  isOnline: boolean
  chatPricePerMin?: number
  certifications: string[]
  education: { degree?: string; institution?: string; year?: string }[]
}

interface RatingDist {
  1: number
  2: number
  3: number
  4: number
  5: number
  average: number
  total: number
}

interface Offering {
  _id: string
  [key: string]: unknown
}

interface ProfileData {
  astrologer: Astrologer
  reviews: Review[]
  ratingDistribution: RatingDist
  offerings: Offering[]
  totalConsultations: number
}

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={cn(
            s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </span>
  )
}

export default function AstrologerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>("about")
  const [isFavorite, setIsFavorite] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data, isLoading, isError } = useQuery<ProfileData>({
    queryKey: ["astrologer-profile", slug],
    queryFn: async () => {
      const res = await api.get(`/api/astrologers/profile/${slug}`)
      return res.data.data
    },
    enabled: !!slug,
  })

  const astrologer = data?.astrologer
  const reviews = data?.reviews ?? []
  const ratingDistribution = data?.ratingDistribution
  const offerings = data?.offerings ?? []
  const totalConsultations = data?.totalConsultations ?? 0

  function handleChatNow() {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    router.push(`/astrologers?chat=${astrologer?._id}`)
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "about", label: "About" },
    { key: "offerings", label: "Offerings" },
    { key: "reviews", label: "Reviews" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    )
  }

  if (isError || !astrologer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-lg font-semibold text-muted-foreground">Astrologer not found.</p>
          <Link href="/astrologers">
            <Button variant="outline">Browse Astrologers</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const displayName = astrologer.displayName || astrologer.name
  const canChat =
    isAuthenticated &&
    (user as { role?: string } | null)?.role === "user" &&
    astrologer.isOnline

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pb-28">
        {/* Hero Section */}
        <div className="relative h-48 bg-brand-navy overflow-hidden">
          {astrologer.coverPhoto && (
            <img
              src={astrologer.coverPhoto}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />

          {/* Avatar centered at bottom overlapping */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="p-1 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage src={astrologer.avatar} alt={displayName} />
                  <AvatarFallback className="text-2xl font-bold bg-orange-100 text-orange-700">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                {astrologer.isOnline && (
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-16 px-4 flex flex-col items-center text-center gap-2">
          <h2 className="text-2xl font-extrabold text-foreground">{displayName}</h2>
          {astrologer.primaryExpertise && (
            <p className="text-muted-foreground text-sm">{astrologer.primaryExpertise}</p>
          )}
          <div className="flex items-center gap-2">
            <StarRow rating={astrologer.rating} />
            <span className="font-semibold text-sm">{astrologer.rating?.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">({astrologer.totalRatings} reviews)</span>
          </div>
          {astrologer.chatPricePerMin !== undefined && (
            <div className="flex items-center gap-1 text-brand-orange font-semibold text-sm">
              <IndianRupee size={14} />
              <span>{astrologer.chatPricePerMin}/min</span>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mx-4 mt-6 bg-muted rounded-2xl py-4 grid grid-cols-4 divide-x divide-border">
          <div className="flex flex-col items-center px-2">
            <span className="font-bold text-lg text-foreground">{astrologer.rating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">Rating</span>
          </div>
          <div className="flex flex-col items-center px-2">
            <span className="font-bold text-lg text-foreground">{astrologer.totalRatings}</span>
            <span className="text-xs text-muted-foreground">Reviews</span>
          </div>
          <div className="flex flex-col items-center px-2">
            <span className="font-bold text-lg text-foreground">{totalConsultations}</span>
            <span className="text-xs text-muted-foreground">Consultations</span>
          </div>
          <div className="flex flex-col items-center px-2">
            <span className="font-bold text-lg text-foreground">{astrologer.experience ?? 0}yr</span>
            <span className="text-xs text-muted-foreground">Experience</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 mx-4 flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "text-brand-orange border-b-2 border-brand-orange"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4 px-4">
          {/* About Tab */}
          {activeTab === "about" && (
            <div className="space-y-6">
              {/* Biography / About Me */}
              {(astrologer.biography || astrologer.aboutMe) && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">About</h3>
                  {astrologer.biography && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{astrologer.biography}</p>
                  )}
                  {astrologer.aboutMe && astrologer.aboutMe !== astrologer.biography && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{astrologer.aboutMe}</p>
                  )}
                </div>
              )}

              {/* Languages */}
              {astrologer.languages?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Globe2 size={16} /> Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {astrologer.languages.map((lang) => (
                      <span key={lang} className="bg-muted px-2 py-1 rounded-full text-xs text-foreground">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {astrologer.skills?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {astrologer.skills.map((skill) => (
                      <span key={skill} className="bg-muted px-2 py-1 rounded-full text-xs text-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expertise */}
              {astrologer.expertise?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {astrologer.expertise.map((exp) => (
                      <span
                        key={exp}
                        className="bg-brand-orange/10 text-brand-orange px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {astrologer.education?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Award size={16} /> Education
                  </h3>
                  <ul className="space-y-2">
                    {astrologer.education.map((edu, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{edu.degree}</span>
                        {edu.institution && (
                          <span> â€” {edu.institution}</span>
                        )}
                        {edu.year && (
                          <span className="text-xs ml-1 text-muted-foreground">({edu.year})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {astrologer.certifications?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" /> Certifications
                  </h3>
                  <ul className="space-y-1">
                    {astrologer.certifications.map((cert, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Offerings Tab */}
          {activeTab === "offerings" && (
            <div>
              {offerings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <MessageCircle size={40} className="text-muted-foreground/40" />
                  <p className="text-muted-foreground font-medium">No offerings available yet.</p>
                  <p className="text-xs text-muted-foreground">Check back later for sessions and packages.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {offerings.map((offering: any) => (
                    <OfferingCard key={offering._id} offering={offering as any} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {ratingDistribution && (
                <RatingDistribution distribution={ratingDistribution} />
              )}

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <Star size={36} className="text-muted-foreground/40" />
                  <p className="text-muted-foreground font-medium">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id} className="border border-border">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={review.userId?.avatar} alt={review.userId?.name} />
                            <AvatarFallback className="text-xs">
                              {getInitials(review.userId?.name ?? "U")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {review.userId?.name ?? "User"}
                            </p>
                            <div className="flex items-center gap-1">
                              <StarRow rating={review.rating} size={12} />
                              <span className="text-xs text-muted-foreground ml-1">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.review && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.review}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border px-4 py-3 flex items-center gap-3 shadow-lg">
        <Button
          onClick={handleChatNow}
          disabled={!canChat}
          className={cn(
            "flex-1 font-semibold",
            canChat
              ? "bg-brand-orange hover:bg-brand-orange/90 text-white"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <MessageCircle size={16} className="mr-2" />
          {!isAuthenticated
            ? "Login to Chat"
            : !astrologer.isOnline
            ? "Offline"
            : "Chat Now"}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          className="shrink-0"
          title={copied ? "Copied!" : "Share"}
        >
          <Share2 size={16} className={cn(copied && "text-green-500")} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsFavorite((f) => !f)}
          className="shrink-0"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={16}
            className={cn(isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")}
          />
        </Button>
      </div>

      <Footer />
    </div>
  )
}

