"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AstrologerCard } from "@/components/astrologer/AstrologerCard";
import { OfferingCard } from "@/components/offering/OfferingCard";
import { searchService } from "@/services/search.service";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AstrologerFilters {
  expertise: string;
  language: string;
  minRating: string;
  minExperience: string;
}

interface OfferingFilters {
  category: string;
  minPrice: string;
  maxPrice: string;
}

type ActiveType = "astrologers" | "offerings";

const OFFERING_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "remedy", label: "Remedy" },
  { value: "puja", label: "Puja" },
  { value: "chadhava", label: "Chadhava" },
  { value: "gemstone", label: "Gemstone" },
  { value: "rudraksha", label: "Rudraksha" },
  { value: "yantra", label: "Yantra" },
  { value: "report", label: "Report" },
  { value: "service", label: "Service" },
  { value: "digital_product", label: "Digital Product" },
  { value: "other", label: "Other" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "1", label: "1+ Stars" },
  { value: "2", label: "2+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "5", label: "5 Stars" },
];

// â”€â”€â”€ Sidebar: Astrologer Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AstrologerFilterSidebar({
  filters,
  onChange,
}: {
  filters: AstrologerFilters;
  onChange: (f: AstrologerFilters) => void;
}) {
  const set = (key: keyof AstrologerFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <aside className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <SlidersHorizontal className="h-4 w-4 text-brand-orange" />
        <span className="font-semibold text-sm text-brand-navy">Filters</span>
      </div>

      {/* Expertise */}
      <div className="space-y-1.5">
        <Label htmlFor="f-expertise" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Expertise
        </Label>
        <Input
          id="f-expertise"
          placeholder="e.g. Vedic, Tarot..."
          value={filters.expertise}
          onChange={(e) => set("expertise", e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <Label htmlFor="f-language" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Language
        </Label>
        <Input
          id="f-language"
          placeholder="e.g. Hindi, English..."
          value={filters.language}
          onChange={(e) => set("language", e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* Min Rating */}
      <div className="space-y-1.5">
        <Label htmlFor="f-rating" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Min Rating
        </Label>
        <select
          id="f-rating"
          value={filters.minRating}
          onChange={(e) => set("minRating", e.target.value)}
          className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
        >
          {RATING_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Min Experience */}
      <div className="space-y-1.5">
        <Label htmlFor="f-experience" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Min Experience (yrs)
        </Label>
        <Input
          id="f-experience"
          type="number"
          min={0}
          placeholder="0"
          value={filters.minExperience}
          onChange={(e) => set("minExperience", e.target.value)}
          className="h-8 text-sm"
        />
      </div>
    </aside>
  );
}

// â”€â”€â”€ Sidebar: Offering Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OfferingFilterSidebar({
  filters,
  onChange,
}: {
  filters: OfferingFilters;
  onChange: (f: OfferingFilters) => void;
}) {
  const set = (key: keyof OfferingFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <aside className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <SlidersHorizontal className="h-4 w-4 text-brand-orange" />
        <span className="font-semibold text-sm text-brand-navy">Filters</span>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="f-category" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Category
        </Label>
        <select
          id="f-category"
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
          className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
        >
          {OFFERING_CATEGORIES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Min Price */}
      <div className="space-y-1.5">
        <Label htmlFor="f-minprice" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Min Price (â‚¹)
        </Label>
        <Input
          id="f-minprice"
          type="number"
          min={0}
          placeholder="0"
          value={filters.minPrice}
          onChange={(e) => set("minPrice", e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* Max Price */}
      <div className="space-y-1.5">
        <Label htmlFor="f-maxprice" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Max Price (â‚¹)
        </Label>
        <Input
          id="f-maxprice"
          type="number"
          min={0}
          placeholder="Any"
          value={filters.maxPrice}
          onChange={(e) => set("maxPrice", e.target.value)}
          className="h-8 text-sm"
        />
      </div>
    </aside>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") ?? "";
  const initialType = (searchParams.get("type") as ActiveType) ?? "astrologers";

  const [searchInput, setSearchInput] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [activeType, setActiveType] = useState<ActiveType>(initialType);

  const [astroFilters, setAstroFilters] = useState<AstrologerFilters>({
    expertise: "",
    language: "",
    minRating: "",
    minExperience: "",
  });

  const [offeringFilters, setOfferingFilters] = useState<OfferingFilters>({
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  // Debounce search input -> debouncedQ (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Sync URL when debouncedQ or activeType changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    params.set("type", activeType);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [debouncedQ, activeType, router]);

  // â”€â”€ Build query params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const astroQueryParams: Record<string, string> = {};
  if (debouncedQ) astroQueryParams.q = debouncedQ;
  if (astroFilters.expertise) astroQueryParams.expertise = astroFilters.expertise;
  if (astroFilters.language) astroQueryParams.language = astroFilters.language;
  if (astroFilters.minRating) astroQueryParams.minRating = astroFilters.minRating;
  if (astroFilters.minExperience) astroQueryParams.minExperience = astroFilters.minExperience;

  const offeringQueryParams: Record<string, string> = {};
  if (debouncedQ) offeringQueryParams.q = debouncedQ;
  if (offeringFilters.category) offeringQueryParams.category = offeringFilters.category;
  if (offeringFilters.minPrice) offeringQueryParams.minPrice = offeringFilters.minPrice;
  if (offeringFilters.maxPrice) offeringQueryParams.maxPrice = offeringFilters.maxPrice;

  // â”€â”€ Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const {
    data: astroData,
    isLoading: astroLoading,
    isFetching: astroFetching,
  } = useQuery({
    queryKey: ["search", "astrologers", astroQueryParams],
    queryFn: () =>
      searchService.searchAstrologers(astroQueryParams).then((r) => r.data),
    enabled: activeType === "astrologers",
    staleTime: 30_000,
  });

  const {
    data: offeringData,
    isLoading: offeringLoading,
    isFetching: offeringFetching,
  } = useQuery({
    queryKey: ["search", "offerings", offeringQueryParams],
    queryFn: () =>
      searchService.searchOfferings(offeringQueryParams).then((r) => r.data),
    enabled: activeType === "offerings",
    staleTime: 30_000,
  });

  const astrologers = astroData?.data ?? [];
  const offerings = offeringData?.data ?? [];

  const isLoading =
    activeType === "astrologers"
      ? astroLoading || astroFetching
      : offeringLoading || offeringFetching;

  const resultCount =
    activeType === "astrologers" ? astrologers.length : offerings.length;

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* â”€â”€ Header / Search bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-brand-navy text-white py-8">
        <div className="container">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-4">Search</h1>

          <div className="relative max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search astrologers, offeringsâ€¦"
              className="w-full h-11 rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/60 focus:bg-white/15 transition"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5">
            {(["astrologers", "offerings"] as ActiveType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  "px-5 py-1.5 rounded-full text-sm font-semibold capitalize transition-all",
                  activeType === type
                    ? "bg-brand-orange text-white shadow"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main className="flex-1 container py-8">
        <div className="flex gap-6 items-start">

          {/* â”€â”€ Filter sidebar (hidden on mobile) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="hidden md:block w-56 shrink-0 bg-white rounded-xl border border-border p-5 shadow-sm sticky top-4">
            {activeType === "astrologers" ? (
              <AstrologerFilterSidebar
                filters={astroFilters}
                onChange={setAstroFilters}
              />
            ) : (
              <OfferingFilterSidebar
                filters={offeringFilters}
                onChange={setOfferingFilters}
              />
            )}
          </div>

          {/* â”€â”€ Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            {!isLoading && (
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                {resultCount > 0
                  ? `${resultCount} result${resultCount !== 1 ? "s" : ""}${debouncedQ ? ` for "${debouncedQ}"` : ""}`
                  : null}
              </p>
            )}

            {/* Loading */}
            {isLoading ? (
              <div className="flex justify-center py-24">
                <LoadingSpinner size="lg" />
              </div>
            ) : resultCount === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold text-brand-navy mb-1">
                  No results found{debouncedQ ? ` for "${debouncedQ}"` : ""}
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Try adjusting your search term or clearing the filters to see
                  more {activeType}.
                </p>
              </div>
            ) : activeType === "astrologers" ? (
              /* Astrologer grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {astrologers.map((a: any) => (
                  <AstrologerCard key={a._id || a.id} astrologer={a} />
                ))}
              </div>
            ) : (
              /* Offering grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {offerings.map((o: any) => (
                  <OfferingCard key={o._id} offering={o} showAstrologer />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

