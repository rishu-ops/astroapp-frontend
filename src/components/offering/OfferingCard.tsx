import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials, truncate } from "@/lib/utils";

interface Astrologer {
  _id?: string;
  name?: string;
  displayName?: string;
  avatar?: string;
}

interface Offering {
  _id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription?: string;
  description?: string;
  thumbnail?: string;
  price: number;
  currency?: string;
  views?: number;
  astrologerId?: string | Astrologer;
}

interface OfferingCardProps {
  offering: Offering;
  showAstrologer?: boolean;
  className?: string;
}

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

const CATEGORY_BADGE_CLASS: Record<string, string> = {
  remedy: "bg-green-100 text-green-700 border-green-200",
  puja: "bg-orange-100 text-orange-700 border-orange-200",
  chadhava: "bg-pink-100 text-pink-700 border-pink-200",
  gemstone: "bg-blue-100 text-blue-700 border-blue-200",
  rudraksha: "bg-amber-100 text-amber-700 border-amber-200",
  yantra: "bg-purple-100 text-purple-700 border-purple-200",
  report: "bg-indigo-100 text-indigo-700 border-indigo-200",
  service: "bg-yellow-100 text-yellow-700 border-yellow-200",
  digital_product: "bg-cyan-100 text-cyan-700 border-cyan-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatCategoryLabel(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function OfferingCard({
  offering,
  showAstrologer = false,
  className,
}: OfferingCardProps) {
  const {
    title,
    slug,
    category,
    shortDescription,
    thumbnail,
    price,
    currency = "INR",
    views,
    astrologerId,
  } = offering;

  const emoji = CATEGORY_EMOJI[category] ?? CATEGORY_EMOJI.other;
  const badgeClass =
    CATEGORY_BADGE_CLASS[category] ?? CATEGORY_BADGE_CLASS.other;

  const astrologerObj =
    showAstrologer &&
    astrologerId !== null &&
    typeof astrologerId === "object"
      ? (astrologerId as Astrologer)
      : null;

  const astrologerName =
    astrologerObj?.displayName ?? astrologerObj?.name ?? "";

  return (
    <Link href={`/offerings/${slug}`} className="block group">
      <div
        className={cn(
          "astro-card flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md h-full",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-5xl select-none">{emoji}</span>
          )}

          {/* Category badge overlay */}
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                badgeClass
              )}
            >
              {formatCategoryLabel(category)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          {/* Title */}
          <h3 className="font-bold text-brand-navy truncate leading-snug group-hover:text-brand-orange transition-colors duration-150">
            {title}
          </h3>

          {/* Short description */}
          {shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {shortDescription}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price + Views row */}
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-brand-orange flex items-center gap-0.5 text-base">
              <span className="text-sm">â‚¹</span>
              {price.toLocaleString("en-IN")}
            </span>

            {typeof views === "number" && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                {views.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Astrologer row */}
          {astrologerObj && astrologerName && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-1">
              <Avatar className="h-6 w-6">
                {astrologerObj.avatar && (
                  <AvatarImage
                    src={astrologerObj.avatar}
                    alt={astrologerName}
                  />
                )}
                <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                  {getInitials(astrologerName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {truncate(astrologerName, 24)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

