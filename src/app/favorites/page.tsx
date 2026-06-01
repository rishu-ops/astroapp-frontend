"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Heart } from "lucide-react"
import Link from "next/link"

import { ProtectedRoute } from "@/components/common/ProtectedRoute"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AstrologerCard } from "@/components/astrologer/AstrologerCard"
import { OfferingCard } from "@/components/offering/OfferingCard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { favoriteService } from "@/services/favorite.service"

type ActiveTab = "astrologers" | "offerings"

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("astrologers")
  const queryClient = useQueryClient()

  const { data: favoriteAstrologers, isLoading: loadingAstrologers } = useQuery({
    queryKey: ["favorites", "astrologers"],
    queryFn: () => favoriteService.getAll("astrologers"),
  })

  const { data: favoriteOfferings, isLoading: loadingOfferings } = useQuery({
    queryKey: ["favorites", "offerings"],
    queryFn: () => favoriteService.getAll("offerings"),
  })

  const removeFavorite = useMutation({
    mutationFn: ({ id, type }: { id: string; type: ActiveTab }) =>
      favoriteService.remove(id, type),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", variables.type] })
    },
  })

  const tabs: { label: string; value: ActiveTab }[] = [
    { label: "Astrologers", value: "astrologers" },
    { label: "Offerings", value: "offerings" },
  ]

  const isLoading = activeTab === "astrologers" ? loadingAstrologers : loadingOfferings
  const items =
    activeTab === "astrologers"
      ? (favoriteAstrologers as any)?.data?.data ?? []
      : (favoriteOfferings as any)?.data?.data ?? []

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        {/* Header */}
        <div className="bg-brand-navy py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-400 fill-red-400" />
              My Favorites
            </h1>
            <p className="text-blue-200 mt-2 text-sm">
              Your saved astrologers and offerings in one place.
            </p>
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.value
                    ? "border-brand-navy text-brand-navy"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Heart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-1">
                No saved {activeTab === "astrologers" ? "astrologers" : "offerings"} yet
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Browse and save your favourites to see them here.
              </p>
              <Button asChild className="bg-brand-navy hover:bg-brand-navy/90 text-white">
                <Link href={activeTab === "astrologers" ? "/astrologers" : "/offerings"}>
                  Browse {activeTab === "astrologers" ? "Astrologers" : "Offerings"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item: any) => (
                <div key={item._id ?? item.id} className="relative group">
                  {/* Remove button */}
                  <button
                    aria-label="Remove from favorites"
                    onClick={() =>
                      removeFavorite.mutate({
                        id: item._id ?? item.id,
                        type: activeTab,
                      })
                    }
                    disabled={removeFavorite.isPending}
                    className={cn(
                      "absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white shadow-md",
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      "hover:bg-red-50 focus:opacity-100",
                      removeFavorite.isPending && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>

                  {activeTab === "astrologers" ? (
                    <AstrologerCard astrologer={item} />
                  ) : (
                    <OfferingCard offering={item} />
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}


