'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { adminService } from '@/services/admin.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Astrologer, ApplicationStatus } from '@/types';
import {
  CheckCircle, XCircle, Clock, Eye, Search, FileText,
  User, Phone, Mail, Star, AlertTriangle, X, Loader2,
} from 'lucide-react';
import { formatDate, getInitials, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUS_TABS: { value: ApplicationStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '' },
  { value: 'under_review', label: 'Under Review', color: 'text-amber-600' },
  { value: 'registered', label: 'Registered', color: 'text-blue-600' },
  { value: 'approved', label: 'Approved', color: 'text-green-600' },
  { value: 'rejected', label: 'Rejected', color: 'text-destructive' },
];

const STATUS_BADGE: Record<ApplicationStatus, { label: string; variant: string; icon: React.ComponentType<{ className?: string }> }> = {
  registered: { label: 'Registered', variant: 'bg-blue-100 text-blue-700', icon: FileText },
  under_review: { label: 'Under Review', variant: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', variant: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function AdminApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Astrologer | null>(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', statusFilter],
    queryFn: () => adminService.getApplications(
      statusFilter === 'all' ? undefined : statusFilter
    ).then(r => r.data),
  });

  const applications: Astrologer[] = data?.data || [];
  const filtered = search
    ? applications.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.primaryExpertise?.toLowerCase().includes(search.toLowerCase())
      )
    : applications;

  const approve = useMutation({
    mutationFn: (id: string) => adminService.approveApplication(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['admin-applications'] });
      queryClient.refetchQueries({ queryKey: ['admin-analytics'] });
      setSelected(null);
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['admin-applications'] });
      queryClient.refetchQueries({ queryKey: ['admin-analytics'] });
      setRejectModal(false);
      setRejectReason('');
      setSelected(null);
    },
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        <div className="bg-brand-navy text-white py-8">
          <div className="container">
            <h1 className="text-2xl font-extrabold">Astrologer Applications</h1>
            <p className="text-white/50 text-sm mt-1">Review and manage onboarding requests</p>
          </div>
        </div>

        <main className="flex-1 container py-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 bg-white" placeholder="Search by name, email, expertise..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1 p-1 bg-muted rounded-xl">
              {STATUS_TABS.map(({ value, label }) => (
                <button key={value} onClick={() => setStatusFilter(value)}
                  className={cn('px-3 py-1.5 rounded-lg text-sm font-semibold transition-all',
                    statusFilter === value ? 'bg-white shadow-sm text-brand-orange' : 'text-muted-foreground hover:text-foreground')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {isLoading ? <LoadingSpinner /> : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-semibold text-sm text-muted-foreground">
                  {filtered.length} application{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No applications found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map(app => {
                    const statusCfg = STATUS_BADGE[app.applicationStatus];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <div key={app._id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarFallback className="bg-brand-orange/10 text-brand-orange font-bold">
                            {getInitials(app.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{app.name}</span>
                            {app.displayName && app.displayName !== app.name && (
                              <span className="text-xs text-muted-foreground">({app.displayName})</span>
                            )}
                            <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', statusCfg.variant)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusCfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                            <span>{app.email}</span>
                            <span>·</span>
                            <span>{app.primaryExpertise}</span>
                            <span>·</span>
                            <span>{app.experience} yrs</span>
                            {app.appliedAt && <><span>·</span><span>{timeAgo(app.appliedAt)}</span></>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="gap-1.5"
                            onClick={() => setSelected(app)}>
                            <Eye className="h-3.5 w-3.5" /> Review
                          </Button>

                          {(app.applicationStatus === 'under_review' || app.applicationStatus === 'registered') && (
                            <>
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white border-0 gap-1.5"
                                onClick={() => approve.mutate(app._id)} disabled={approve.isPending}>
                                <CheckCircle className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="gap-1.5"
                                onClick={() => { setSelected(app); setRejectModal(true); }}>
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── Detail Drawer ── */}
        {selected && !rejectModal && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
            <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between z-10">
                <h2 className="font-extrabold text-lg">Application Detail</h2>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-brand-orange/10 text-brand-orange text-xl font-bold">
                      {getInitials(selected.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <p className="text-muted-foreground text-sm">{selected.displayName}</p>
                    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1',
                      STATUS_BADGE[selected.applicationStatus].variant)}>
                      {selected.applicationStatus}
                    </span>
                  </div>
                </div>

                {/* Rejection reason */}
                {selected.applicationStatus === 'rejected' && selected.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Rejection Reason</p>
                      <p className="text-sm text-red-600 mt-1">{selected.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Details grid */}
                <div className="space-y-4">
                  {[
                    { label: 'Personal', items: [
                      { icon: User, label: 'Full Name', value: selected.name },
                      { icon: Mail, label: 'Email', value: selected.email },
                      { icon: Phone, label: 'Phone', value: selected.phone },
                    ]},
                    { label: 'Professional', items: [
                      { icon: Star, label: 'Primary Expertise', value: selected.primaryExpertise },
                      { icon: Clock, label: 'Experience', value: `${selected.experience} years` },
                      { icon: FileText, label: 'Languages', value: selected.languages?.join(', ') },
                    ]},
                  ].map(({ label, items }) => (
                    <div key={label}>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{label}</h4>
                      <div className="space-y-2">
                        {items.map(({ icon: Icon, label: l, value }) => value && (
                          <div key={l} className="flex items-center gap-3 text-sm">
                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">{l}:</span>
                            <span className="font-medium flex-1">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Bio */}
                  {selected.shortBio && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Short Bio</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">{selected.shortBio}</p>
                    </div>
                  )}

                  {/* Government ID */}
                  {selected.governmentId?.url && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Documents</h4>
                      <a href={selected.governmentId.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-brand-orange hover:underline p-3 bg-brand-orange/5 rounded-xl">
                        <FileText className="h-4 w-4" />
                        View Government ID ({selected.governmentId.docType})
                      </a>
                    </div>
                  )}

                  {/* Applied at */}
                  {selected.appliedAt && (
                    <p className="text-xs text-muted-foreground">
                      Applied {timeAgo(selected.appliedAt)} · {formatDate(selected.appliedAt)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {(selected.applicationStatus === 'under_review' || selected.applicationStatus === 'registered') && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white border-0 gap-2"
                      onClick={() => approve.mutate(selected._id)} disabled={approve.isPending}>
                      <CheckCircle className="h-4 w-4" />
                      {approve.isPending ? 'Approving...' : 'Approve Application'}
                    </Button>
                    <Button variant="destructive" className="flex-1 gap-2"
                      onClick={() => setRejectModal(true)}>
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Reject Modal ── */}
        {rejectModal && selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => { setRejectModal(false); setRejectReason(''); }} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Reject Application</h3>
                  <p className="text-sm text-muted-foreground">{selected.name}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold text-sm">Rejection Reason <span className="text-destructive">*</span></Label>
                <Textarea
                  rows={4}
                  placeholder="Provide a clear reason so the applicant can understand and re-apply with corrections..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">This message will be shown to the applicant.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setRejectModal(false); setRejectReason(''); }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => reject.mutate({ id: selected._id, reason: rejectReason })}
                  disabled={!rejectReason.trim() || reject.isPending}
                >
                  {reject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  {reject.isPending ? 'Rejecting...' : 'Confirm Reject'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
