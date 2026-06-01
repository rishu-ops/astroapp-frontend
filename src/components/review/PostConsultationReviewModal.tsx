"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { Star, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore } from "@/store/chatStore"
import { useAuthStore } from "@/store/authStore"
import { reviewService } from "@/services/review.service"
import { chatService } from "@/services/chat.service"
import { StarRatingInput } from "./StarRatingInput"
import { cn } from "@/lib/utils"

export function PostConsultationReviewModal() {
  const { chatEndedInfo, clearChatEnded } = useChatStore()
  const { user } = useAuthStore()

  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [canReview, setCanReview] = useState<boolean | null>(null)
  const [astrologerName, setAstrologerName] = useState("")
  const [astrologerId, setAstrologerId] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const shouldShow =
    chatEndedInfo &&
    user?.role === "user" &&
    !["cancelled", "declined"].includes(chatEndedInfo.reason)

  useEffect(() => {
    if (!shouldShow) return

    let cancelled = false

    const check = async () => {
      setCanReview(null)
      setRating(0)
      setReviewText("")
      setSubmitted(false)

      try {
        const [canReviewRes, chatRes] = await Promise.all([
          reviewService.canReview(chatEndedInfo!.chatId),
          chatService.getChatById(chatEndedInfo!.chatId),
        ])

        if (cancelled) return

        const canReviewValue = canReviewRes.data?.data?.canReview ?? false
        const chat = chatRes.data?.data

        if (!canReviewValue) {
          clearChatEnded()
          return
        }

        const name =
          (chat as any)?.astrologer?.displayName ||
          (chat as any)?.astrologer?.name ||
          (chat as any)?.astrologerName ||
          "the astrologer"

        const id =
          (chat as any)?.astrologer?._id ||
          (chat as any)?.astrologerId ||
          ""

        setAstrologerName(name)
        setAstrologerId(id)
        setCanReview(true)
      } catch {
        if (!cancelled) clearChatEnded()
      }
    }

    check()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatEndedInfo?.chatId])

  const mutation = useMutation({
    mutationFn: () =>
      reviewService.create({
        astrologerId,
        consultationId: chatEndedInfo!.chatId,
        rating,
        review: reviewText.trim() || undefined,
      }),
    onSuccess: () => {
      setSubmitted(true)
      setTimeout(() => {
        clearChatEnded()
      }, 2000)
    },
  })

  if (!shouldShow) return null
  if (!canReview && canReview !== null) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={clearChatEnded}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Loading state */}
        {canReview === null && (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-gray-500">Loadingâ€¦</p>
          </div>
        )}

        {/* Submitted success state */}
        {canReview === true && submitted && (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Star className="h-8 w-8 fill-orange-500 stroke-orange-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Thank you!</h2>
            <p className="text-gray-500 text-sm">Your review has been submitted.</p>
          </div>
        )}

        {/* Review form */}
        {canReview === true && !submitted && (
          <>
            {/* Star icon */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Star className="h-8 w-8 fill-orange-500 stroke-orange-500" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900">
                How was your consultation?
              </h2>
              {astrologerName && (
                <p className="text-gray-500 text-sm">
                  with{" "}
                  <span className="font-semibold text-gray-700">{astrologerName}</span>
                </p>
              )}
            </div>

            {/* Star rating */}
            <div className="flex justify-center">
              <StarRatingInput value={rating} onChange={setRating} size="lg" />
            </div>

            {/* Optional review text */}
            <Textarea
              placeholder="Share your experience (optional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              className="resize-none text-sm rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
            />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={clearChatEnded}
                className="rounded-xl text-gray-500 hover:text-gray-700"
                disabled={mutation.isPending}
              >
                Skip
              </Button>

              <Button
                onClick={() => mutation.mutate()}
                disabled={rating === 0 || mutation.isPending}
                className={cn(
                  "rounded-xl font-semibold text-white transition-opacity",
                  "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
                  (rating === 0 || mutation.isPending) && "opacity-50 cursor-not-allowed"
                )}
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submittingâ€¦
                  </span>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>

            {/* Error feedback */}
            {mutation.isError && (
              <p className="text-xs text-red-500">
                Something went wrong. Please try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}


