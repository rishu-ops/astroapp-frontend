"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, XCircle, Clock, Search } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { offeringService } from "@/services/offering.service"
import { formatDate } from "@/lib/utils"

type ActiveTab = "pending" | "all" | "approved" | "rejected"

export default function AdminOfferingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<ActiveTab>("pending")
  const [rejectModal, setRejectModal] = useState(false)
  const [selectedId, setSelectedId] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [adminNotes, setAdminNotes] = useState("")

  const tabFilterMap: Record<ActiveTab, Record<string, string>> = {
    pending: { reviewStatus: 'pending' },
    approved: { reviewStatus: 'approved' },
    rejected: { reviewStatus: 'rejected' },
    all: {},
  }

  const tabFilter = tabFilterMap[activeTab]

  const { data, isLoading } = useQuery({
    queryKey: ['admin-offerings', activeTab],
    queryFn: () => offeringService.adminList(tabFilter),
  })

  const offerings = (data as any)?.data?.data ?? []

  const approveMutation = useMutation({
    mutationFn: (id: string) => offeringService.adminApprove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offerings"] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes: string }) =>
      offeringService.adminReject(id, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offerings"] })
      setRejectModal(false)
      setSelectedId("")
      setRejectReason("")
      setAdminNotes("")
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => offeringService.adminArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-offerings"] })
    },
  })

  const handleOpenRejectModal = (id: string) => {
    setSelectedId(id)
    setRejectReason("")
    setAdminNotes("")
    setRejectModal(true)
  }

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return
    rejectMutation.mutate({ id: selectedId, reason: rejectReason, notes: adminNotes })
  }

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
    }
    if (status === "rejected") {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
  }

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "pending", label: "Pending Review" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ]

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Header */}
        <div className="bg-brand-navy py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white">Manage Offerings</h1>
            <p className="text-blue-200 mt-1 text-sm">Review and manage astrologer offerings</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab Row */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-brand-navy text-brand-navy"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy" />
              </div>
            ) : offerings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Search className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">No offerings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Offering</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Astrologer</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Price</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {offerings.map((offering: any) => (
                      <tr key={offering._id} className="hover:bg-gray-50 transition-colors">
                        {/* Thumbnail + Title */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={offering.thumbnail || "/placeholder.png"}
                              alt={offering.title}
                              className="h-12 w-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1">{offering.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{offering.category}</p>
                            </div>
                          </div>
                        </td>

                        {/* Astrologer */}
                        <td className="px-4 py-3 text-gray-700">
                          {offering.astrologerId?.name ?? "â€”"}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-gray-700">
                          {offering.price != null ? `â‚¹${offering.price}` : "â€”"}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {offering.createdAt ? formatDate(offering.createdAt) : "â€”"}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          {getStatusBadge(offering.reviewStatus)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 h-7"
                              onClick={() => approveMutation.mutate(offering._id)}
                              disabled={approveMutation.isPending || offering.reviewStatus === "approved"}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs px-3 py-1 h-7"
                              onClick={() => handleOpenRejectModal(offering._id)}
                              disabled={offering.reviewStatus === "rejected"}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-3 py-1 h-7"
                              onClick={() => archiveMutation.mutate(offering._id)}
                              disabled={archiveMutation.isPending}
                            >
                              Archive
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reject Modal */}
        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Offering</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes for admin reference..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setRejectModal(false)
                    setSelectedId("")
                    setRejectReason("")
                    setAdminNotes("")
                  }}
                  disabled={rejectMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleConfirmReject}
                  disabled={!rejectReason.trim() || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Rejecting...
                    </span>
                  ) : (
                    "Confirm Reject"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

