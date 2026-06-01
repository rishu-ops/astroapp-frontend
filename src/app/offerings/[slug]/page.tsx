"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Heart,
  CheckCircle,
  Loader2,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { OfferingCard } from "@/components/offering/OfferingCard";

import { offeringService } from "@/services/offering.service";
import { favoriteService } from "@/services/favorite.service";
import { useAuthStore } from "@/store/authStore";
import { cn, getInitials } from "@/lib/utils";
import { Astrologer, Offering } from "@/types";

/* â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const CATEGORY_EMOJI: Record<string, string> = {
  remedy: "ðŸŒ¿",
  puja: "ðŸª”",
  chadhava: "ðŸŒ¸",
  gemstone: "ðŸ’Ž",
  rudraksha: "ðŸ“¿",
  yantra: "ðŸ”¯",
  report: "ðŸ“Š",
  service: "â­",
  digital_product: "ðŸ’»",
  other: "âœ¨",
};

function formatCategoryLabel(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          )}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {rating?.toFixed(1)}
      </span>
    </span>
  );
}

/* â”€â”€ tab types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type Tab = "overview" | "benefits" | "instructions";

/* â”€â”€ page component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function OfferingDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const queryClient = useQueryClient();

  const { user, isAuthenticated } = useAuthStore();
  const isRegularUser = isAuthenticated && user?.role === "user";

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  /* â”€â”€ fetch offering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const {
    data: offeringResp,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["offering", slug],
    queryFn: () => offeringService.getBySlug(slug),
    enabled: !!slug,
  });

  const offering = offeringResp?.data?.data as Offering | undefined;
  const astrologer =
    offering && typeof offering.astrologerId === "object"
      ? (offering.astrologerId as Astrologer)
      : null;
  const astrologerId = astrologer?._id ?? astrologer?.id ?? "";

  /* â”€â”€ fetch related offerings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const { data: relatedResp } = useQuery({
    queryKey: ["related-offerings", astrologerId],
    queryFn: () =>
      offeringService.getPublic({ astrologerId, limit: "4" } as Record<
        string,
        string
      >),
    enabled: !!astrologerId,
  });

  const relatedOfferings = (
    (relatedResp?.data?.data as Offering[]) ?? []
  ).filter((o) => o._id !== offering?._id);

  /* â”€â”€ favorite check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const { data: favCheckResp } = useQuery({
    queryKey: ["fav-check", "offering", offering?._id],
    queryFn: () => favoriteService.check("offering", offering!._id),
    enabled: isRegularUser && !!offering?._id,
  });

  const isFavorited = favCheckResp?.data?.data?.isFavorited ?? false;

  /* â”€â”€ toggle favorite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const favMutation = useMutation({
    mutationFn: () =>
      isFavorited
        ? favoriteService.remove("offering", offering!._id)
        : favoriteService.add("offering", offering!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fav-check", "offering", offering?._id],
      });
    },
  });

  /* â”€â”€ derived display values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const displayName =
    astrologer?.displayName ?? astrologer?.name ?? "Astrologer";
  const emoji = CATEGORY_EMOJI[offering?.category ?? "other"] ?? "âœ¨";
  const mainImage =
    galleryIndex !== null
      ? offering?.gallery?.[galleryIndex]
      : (offering?.thumbnail ?? null);

  /* â”€â”€ loading / error states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !offering) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-lg font-medium">Offering not found.</p>
          <Link href="/offerings">
            <Button variant="outline">Browse Offerings</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  /* â”€â”€ render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {/* â”€â”€ Hero image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center mb-4">
          {mainImage ? (
            <img
              src={mainImage}
              alt={offering.title}
              className="h-64 w-full object-cover"
            />
          ) : (
            <span className="text-8xl select-none">{emoji}</span>
          )}
        </div>

        {/* â”€â”€ Gallery thumbnails â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {offering.gallery && offering.gallery.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {/* main thumbnail as first thumb */}
            {offering.thumbnail && (
              <button
                onClick={() => setGalleryIndex(null)}
                className={cn(
                  "h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                  galleryIndex === null
                    ? "border-brand-orange"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={offering.thumbnail}
                  alt="main"
                  className="h-full w-full object-cover"
                />
              </button>
            )}
            {offering.gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setGalleryIndex(idx)}
                className={cn(
                  "h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                  galleryIndex === idx
                    ? "border-brand-orange"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={img}
                  alt={`gallery-${idx}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* â”€â”€ Two-column layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* â”€â”€ LEFT column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex-1 min-w-0">
            {/* Category badge */}
            <Badge
              variant="outline"
              className="mb-3 text-sm capitalize bg-orange-50 text-orange-700 border-orange-200"
            >
              {formatCategoryLabel(offering.category)}
            </Badge>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy leading-tight mb-2">
              {offering.title}
            </h1>

            {/* Short description */}
            {offering.shortDescription && (
              <p className="text-muted-foreground text-base mb-5 leading-relaxed">
                {offering.shortDescription}
              </p>
            )}

            {/* â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="flex gap-1 border-b border-gray-200 mb-5">
              {(["overview", "benefits", "instructions"] as Tab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
                      activeTab === tab
                        ? "border-brand-orange text-brand-orange"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line">
                {offering.description || (
                  <span className="text-muted-foreground italic">
                    No description provided.
                  </span>
                )}
              </div>
            )}

            {/* Benefits tab */}
            {activeTab === "benefits" && (
              <ul className="space-y-3">
                {offering.benefits && offering.benefits.length > 0 ? (
                  offering.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground leading-relaxed">
                        {benefit}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-muted-foreground italic text-sm">
                    No benefits listed.
                  </p>
                )}
              </ul>
            )}

            {/* Instructions tab */}
            {activeTab === "instructions" && (
              <ol className="space-y-3 list-none">
                {offering.instructions && offering.instructions.length > 0 ? (
                  offering.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-foreground leading-relaxed">
                        {step}
                      </span>
                    </li>
                  ))
                ) : (
                  <p className="text-muted-foreground italic text-sm">
                    No instructions provided.
                  </p>
                )}
              </ol>
            )}

            {/* â”€â”€ Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {offering.tags && offering.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {offering.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-gray-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* â”€â”€ RIGHT sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <Card className="rounded-2xl border shadow-md">
              <CardContent className="p-5 flex flex-col gap-5">
                {/* Price */}
                <div className="flex items-end gap-1">
                  <IndianRupee className="h-5 w-5 text-brand-orange mb-0.5 flex-shrink-0" />
                  <span className="text-3xl font-extrabold text-brand-orange leading-none">
                    {offering.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-muted-foreground mb-0.5 ml-1">
                    {offering.currency ?? "INR"}
                  </span>
                </div>

                {/* Save / Favorite button */}
                {isRegularUser ? (
                  <Button
                    variant={isFavorited ? "default" : "outline"}
                    className={cn(
                      "w-full gap-2 transition-all",
                      isFavorited
                        ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                        : "hover:border-red-400 hover:text-red-500"
                    )}
                    onClick={() => favMutation.mutate()}
                    disabled={favMutation.isPending}
                  >
                    {favMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          isFavorited && "fill-current"
                        )}
                      />
                    )}
                    {isFavorited ? "Saved" : "Save"}
                  </Button>
                ) : !isAuthenticated ? (
                  <Link href="/login">
                    <Button variant="outline" className="w-full gap-2">
                      <Heart className="h-4 w-4" />
                      Save
                    </Button>
                  </Link>
                ) : null}

                {/* Divider */}
                <hr className="border-gray-100" />

                {/* Astrologer mini card */}
                {astrologer && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Offered by
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {astrologer.avatar && (
                          <AvatarImage
                            src={astrologer.avatar}
                            alt={displayName}
                          />
                        )}
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-sm">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-brand-navy truncate">
                          {displayName}
                        </p>
                        {typeof astrologer.rating === "number" && (
                          <StarRating rating={astrologer.rating} />
                        )}
                      </div>
                    </div>

                    {/* Chat link */}
                    {astrologerId && (
                      <Link href={`/astrologers?chat=${astrologerId}`}>
                        <Button
                          variant="outline"
                          className="w-full text-sm gap-2 border-brand-orange text-brand-orange hover:bg-orange-50"
                        >
                          Chat with Astrologer
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* â”€â”€ Related offerings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {relatedOfferings.length > 0 && (
          <section className="mt-14">
            <h3 className="text-xl font-bold text-brand-navy mb-5">
              More from {displayName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedOfferings.slice(0, 4).map((rel) => (
                <OfferingCard key={rel._id} offering={rel} showAstrologer />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

