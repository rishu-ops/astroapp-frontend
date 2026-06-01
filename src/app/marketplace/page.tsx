"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { OfferingCard } from "@/components/offering/OfferingCard"
import { offeringService } from "@/services/offering.service"

const CATEGORIES = [
  { value: "all", label: "All", emoji: "ðŸŒŸ" },
  { value: "remedy", label: "Remedy", emoji: "ðŸŒ¿" },
  { value: "puja", label: "Puja", emoji: "ðŸª”" },
  { value: "chadhava", label: "Chadhava", emoji: "ðŸŒ¸" },
  { value: "gemstone", label: "Gemstone", emoji: "ðŸ’Ž" },
  { value: "rudraksha", label: "Rudraksha", emoji: "ðŸ“¿" },
  { value: "yantra", label: "Yantra", emoji: "ðŸ”¯" },
  { value: "report", label: "Report", emoji: "ðŸ“Š" },
  { value: "service", label: "Service", emoji: "â­" },
  { value: "digital_product", label: "Digital", emoji: "ðŸ’»" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price_asc", label: "Price Low" },
  { value: "price_desc", label: "Price High" },
]

export default function MarketplacePage() {
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("newest")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const queryParams: Record<string, string> = {
    sort,
    page: String(page),
    limit: '12',
  }
  if (category !== 'all') queryParams.category = category
  if (search.length > 2) queryParams.q = search

  const { data, isLoading, isError } = useQuery({
    queryKey: ['offerings-public', category, sort, page, search],
    queryFn: () => offeringService.getPublic(queryParams),
  })

  const offerings = (data as any)?.data?.data ?? []
  const total = (data as any)?.total ?? offerings.length
  const totalPages = Math.max(1, Math.ceil(total / 12))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-brand-navy text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-white/70 mb-6 text-base md:text-lg">
            Explore remedies, pujas, gemstones, and spiritual offerings from trusted astrologers.
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search offerings..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-brand-orange"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value)
                setPage(1)
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors
                ${
                  category === cat.value
                    ? "bg-brand-orange text-white border-brand-orange"
                    : "bg-background border-border text-muted-foreground hover:border-brand-orange hover:text-brand-orange"
                }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Sort + result count row */}
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${total} offering${total !== 1 ? "s" : ""} found`}
          </p>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
            className="text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <svg
              className="animate-spin h-8 w-8 text-brand-orange"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>
        ) : isError ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg font-medium">Failed to load offerings.</p>
            <p className="text-sm mt-1">Please try again later.</p>
          </div>
        ) : offerings.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg font-medium">No offerings found.</p>
            <p className="text-sm mt-1">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {offerings.map((offering: any) => (
              <OfferingCard key={offering._id ?? offering.id} offering={offering} showAstrologer />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-md border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Prev
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-md border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}


