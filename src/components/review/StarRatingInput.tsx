"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingInputProps {
  value: number
  onChange: (v: number) => void
  size?: "sm" | "md" | "lg"
  readOnly?: boolean
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export function StarRatingInput({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: StarRatingInputProps) {
  const [hoveredStar, setHoveredStar] = useState(0)

  const sizeClass = sizeMap[size]

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= (hoveredStar || value)

        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={readOnly ? undefined : () => onChange(index)}
            onMouseEnter={readOnly ? undefined : () => setHoveredStar(index)}
            onMouseLeave={readOnly ? undefined : () => setHoveredStar(0)}
            className={cn(
              "transition-colors duration-150 focus:outline-none",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            aria-label={readOnly ? `${index} star` : `Rate ${index} star${index !== 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeClass,
                "transition-colors duration-150",
                isFilled
                  ? "fill-yellow-400 stroke-yellow-400"
                  : "fill-muted stroke-gray-300"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

