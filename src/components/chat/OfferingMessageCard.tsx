import Link from "next/link";
import { cn } from "@/lib/utils";

interface OfferingSnapshot {
  title: string;
  thumbnail?: string;
  price: number;
  currency: string;
  category: string;
  slug: string;
}

interface OfferingMessageCardProps {
  snapshot: OfferingSnapshot;
}

const CATEGORY_EMOJI: Record<string, string> = {
  astrology: "🔮",
  tarot: "🃏",
  numerology: "🔢",
  vastu: "🏠",
  palmistry: "✋",
  horoscope: "♈",
  meditation: "🧘",
  healing: "✨",
  default: "🌟",
};

function getCategoryEmoji(category: string): string {
  const key = category.toLowerCase();
  return CATEGORY_EMOJI[key] ?? CATEGORY_EMOJI.default;
}

export default function OfferingMessageCard({ snapshot }: OfferingMessageCardProps) {
  const { title, thumbnail, price, currency, category, slug } = snapshot;

  return (
    <div
      className={cn(
        "inline-flex gap-3 max-w-xs",
        "bg-white rounded-xl shadow-sm p-3",
        "border border-gray-100 border-l-4 border-l-orange-500"
      )}
    >
      {/* Left: thumbnail or emoji fallback */}
      <div className="flex-shrink-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-14 w-14 object-cover rounded-lg"
          />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-orange-50 flex items-center justify-center text-2xl">
            {getCategoryEmoji(category)}
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="flex flex-col justify-between min-w-0 flex-1">
        {/* Category badge */}
        <span className="text-[10px] font-bold uppercase tracking-wide text-orange-500">
          {category}
        </span>

        {/* Title */}
        <p className="text-sm font-bold text-foreground line-clamp-1 mt-0.5">
          {title}
        </p>

        {/* Price */}
        <p className="text-sm font-bold text-orange-500 mt-0.5">
          ₹{price.toLocaleString("en-IN")}
        </p>

        {/* View Details link */}
        <Link
          href={`/offerings/${slug}`}
          className="text-xs text-orange-500 hover:underline mt-1 inline-flex items-center gap-0.5"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
