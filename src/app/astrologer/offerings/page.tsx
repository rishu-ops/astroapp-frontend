"use client"

import { useState } from "react"
import Link from "next/link"
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"
import { Navbar } from "@/components/layout/Navbar"
import { IncomingChatRequest } from "@/components/chat/IncomingChatRequest"
import { offeringService } from "@/services/offering.service"
import { useSocket } from "@/hooks/useSocket"
import { cn } from "@/lib/utils"
import { truncate } from "@/lib/utils"
import {
  Pencil,
  Trash2,
  Send,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react"
import { Offering } from "@/types"

type ReviewFilter = "all" | "pending" | "approved" | "rejected"
type StatusFilter = "all" | "draft" | "published"

export default function AstrologerOfferingsPage() {
  useSocket()

  const queryClient = useQueryClient()
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["my-offerings", reviewFilter, statusFilter],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (reviewFilter !== "all") params.reviewStatus = reviewFilter
      if (statusFilter !== "all") params.status = statusFilter
      return offeringService.getMine(params)
    },
  })

  const offerings: Offering[] = data?.data?.data ?? []

  const submitMutation = useMutation({
    mutationFn: (id: string) => offeringService.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-offerings"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => offeringService.remove(id),
    onSuccess: () => {
      setConfirmDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ["my-offerings"] })
    },
  })

  const statusTabs: { label: string; status: StatusFilter; review: ReviewFilter }[] = [
    { label: "All", status: "all", review: "all" },
    { label: "Draft", status: "draft", review: "all" },
    { label: "Pending Review", status: "all", review: "pending" },
    { label: "Approved", status: "all", review: "approved" },
    { label: "Rejected", status: "all", review: "rejected" },
  ]

  const activeTabKey = `${statusFilter}:${reviewFilter}`

  function getStatusBadge(status: Offering["status"]) {
    if (status === "published") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          Published
        </Badge>
      )
    }
    if (status === "archived") {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Archived
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Draft
      </Badge>
    )
  }

  function getReviewBadge(reviewStatus: Offering["reviewStatus"]) {
    if (reviewStatus === "approved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          Approved
        </Badge>
      )
    }
    if (reviewStatus === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
        Pending
      </Badge>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["astrologer"]}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        {/* Header */}
        <div className="bg-brand-navy text-white">
          <div className="container py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">My Offerings</h1>
                <p className="text-white/70 text-sm mt-1">
                  Manage your spiritual service offerings
                </p>
              </div>
              <Button
                asChild
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold gap-2"
              >
                <Link href="/astrologer/offerings/new">
                  <Plus className="h-4 w-4" />
                  Create New Offering
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 container py-8">
          {/* Tab filter row */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {statusTabs.map((tab) => {
              const tabKey = `${tab.status}:${tab.review}`
              const isActive = activeTabKey === tabKey
              return (
                <button
                  key={tabKey}
                  onClick={() => {
                    setStatusFilter(tab.status)
                    setReviewFilter(tab.review)
                  }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    isActive
                      ? "bg-brand-orange text-white border-brand-orange"
                      : "bg-background text-muted-foreground border-border hover:border-brand-orange hover:text-brand-orange"
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </div>
          ) : offerings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                No offerings found.
              </p>
              <Button
                asChild
                className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-2"
              >
                <Link href="/astrologer/offerings/new">
                  <Plus className="h-4 w-4" />
                  Create Your First Offering
                </Link>
              </Button>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Offering
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Review
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {offerings.map((offering) => (
                    <>
                      <tr
                        key={offering._id}
                        className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        {/* Thumbnail + title + category */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {offering.thumbnail ? (
                              <img
                                src={offering.thumbnail}
                                alt={offering.title}
                                className="h-12 w-12 rounded-lg object-cover shrink-0 border"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0 border border-brand-orange/20">
                                <span className="text-brand-orange text-xs font-bold">
                                  {offering.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate max-w-[200px]">
                                {truncate(offering.title, 40)}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {offering.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <span className="font-semibold text-foreground">
                            â‚¹{offering.price.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3">
                          {getStatusBadge(offering.status)}
                        </td>

                        {/* Review status badge */}
                        <td className="px-4 py-3">
                          {getReviewBadge(offering.reviewStatus)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit â€” only if draft */}
                            {offering.status === "draft" && (
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-8"
                              >
                                <Link
                                  href={`/astrologer/offerings/${offering._id}/edit`}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Link>
                              </Button>
                            )}

                            {/* Submit for review â€” only if draft and not already pending */}
                            {offering.status === "draft" &&
                              offering.reviewStatus !== "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1.5 h-8 border-amber-300 text-amber-700 hover:bg-amber-50"
                                  disabled={submitMutation.isPending && submitMutation.variables === offering._id}
                                  onClick={() =>
                                    submitMutation.mutate(offering._id)
                                  }
                                >
                                  {submitMutation.isPending &&
                                  submitMutation.variables === offering._id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}
                                  Submit
                                </Button>
                              )}

                            {/* Delete â€” only if draft */}
                            {offering.status === "draft" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 h-8 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  setConfirmDeleteId(offering._id)
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Rejection reason row */}
                      {offering.reviewStatus === "rejected" &&
                        offering.rejectionReason && (
                          <tr
                            key={`${offering._id}-rejection`}
                            className="bg-red-50 border-b last:border-b-0"
                          >
                            <td colSpan={5} className="px-4 py-2">
                              <div className="flex items-start gap-2 text-sm text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>
                                  <span className="font-semibold">
                                    Rejection reason:{" "}
                                  </span>
                                  {offering.rejectionReason}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Delete confirm dialog */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Delete Offering</h3>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this offering? It will be
                permanently removed.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(confirmDeleteId)}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <IncomingChatRequest />
      </div>
    </ProtectedRoute>
  )
}

