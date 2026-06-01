'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { astrologerService } from '@/services/astrologer.service';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ApplicationStatus } from '@/types';
import {
  CheckCircle, Clock, XCircle, AlertCircle, FileText,
  ArrowRight, RefreshCw, Star,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

const STATUS_CONFIG: Record<ApplicationStatus, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  title: string;
  desc: string;
}> = {
  registered: {
    icon: FileText,
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    title: 'Application Received',
    desc: 'Your application has been received. Submit it for review when ready.',
  },
  under_review: {
    icon: Clock,
    color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
    title: 'Under Review',
    desc: 'Our team is reviewing your application. This usually takes 24–48 hours.',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200',
    title: 'Application Approved! 🎉',
    desc: 'Congratulations! Complete your profile to start receiving consultations.',
  },
  rejected: {
    icon: XCircle,
    color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20',
    title: 'Application Rejected',
    desc: 'Unfortunately your application was not approved. See the reason below.',
  },
};

export default function ApplicationStatusPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-application'],
    queryFn: () => astrologerService.getMyApplication().then(r => r.data.data),
    refetchInterval: 60_000, // poll every minute
  });

  const submit = useMutation({
    mutationFn: () => astrologerService.submitForReview(),
    onSuccess: () => refetch(),
  });

  const astrologer = data?.astrologer;
  const status = astrologer?.applicationStatus || 'registered';
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <ProtectedRoute allowedRoles={['astrologer']}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        <div className="bg-brand-navy text-white py-8">
          <div className="container">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full orange-gradient flex items-center justify-center">
                <Star className="h-5 w-5 fill-white text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Application Status</h1>
                <p className="text-white/50 text-sm">NakshatraChat Astrologer Portal</p>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 container py-10 max-w-2xl">
          {isLoading ? (
            <LoadingSpinner fullPage />
          ) : astrologer ? (
            <div className="space-y-6">
              {/* Status card */}
              <div className={cn('rounded-2xl border-2 p-8 text-center', config.bg, config.border)}>
                <div className={cn('w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4', config.bg)}>
                  <StatusIcon className={cn('h-8 w-8', config.color)} />
                </div>
                <h2 className={cn('text-2xl font-extrabold mb-2', config.color)}>{config.title}</h2>
                <p className="text-muted-foreground">{config.desc}</p>

                {/* Rejection reason */}
                {status === 'rejected' && astrologer.rejectionReason && (
                  <div className="mt-4 p-4 bg-white rounded-xl text-left border border-destructive/20">
                    <p className="text-sm font-semibold text-destructive mb-1">Reason for rejection:</p>
                    <p className="text-sm text-foreground">{astrologer.rejectionReason}</p>
                  </div>
                )}

                {/* CTA based on status */}
                <div className="mt-6 flex gap-3 justify-center flex-wrap">
                  {status === 'registered' && (
                    <Button
                      className="orange-gradient border-0 text-white font-bold gap-2"
                      onClick={() => submit.mutate()}
                      disabled={submit.isPending}
                    >
                      {submit.isPending ? <><RefreshCw className="h-4 w-4 animate-spin" />Submitting...</> : <>Submit for Review <ArrowRight className="h-4 w-4" /></>}
                    </Button>
                  )}
                  {status === 'approved' && (
                    <Link href="/astrologer/profile">
                      <Button className="orange-gradient border-0 text-white font-bold gap-2">
                        Complete Profile <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {status === 'rejected' && (
                    <Link href="/register/astrologer">
                      <Button variant="outline" className="gap-2">
                        Re-apply <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1.5 text-muted-foreground">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                </div>
              </div>

              {/* Application summary */}
              <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <h3 className="font-bold text-brand-navy">Application Summary</h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[
                    ['Name', astrologer.name],
                    ['Email', astrologer.email],
                    ['Phone', astrologer.phone],
                    ['Display Name', astrologer.displayName || '—'],
                    ['Primary Expertise', astrologer.primaryExpertise],
                    ['Experience', `${astrologer.experience} years`],
                    ['Languages', astrologer.languages?.join(', ')],
                    ['Applied', astrologer.appliedAt ? formatDate(astrologer.appliedAt) : 'Not yet submitted'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium text-foreground">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Documents */}
              {astrologer.governmentId?.url && (
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-bold text-brand-navy mb-3">Submitted Documents</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Government ID ({astrologer.governmentId.docType})</span>
                    <a href={astrologer.governmentId.url} target="_blank" rel="noreferrer"
                      className="text-brand-orange font-medium hover:underline ml-auto">View</a>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <h3 className="font-bold text-brand-navy mb-4">Process Timeline</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Application Submitted', done: true },
                    { label: 'Document Verification', done: status !== 'registered' },
                    { label: 'Admin Review', done: status === 'approved' || status === 'rejected' },
                    { label: 'Profile Completion', done: astrologer.profileStatus !== 'incomplete' },
                    { label: 'Go Live', done: astrologer.profileStatus === 'live' },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                        done ? 'bg-green-500' : 'bg-muted border-2 border-border'
                      )}>
                        {done && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <span className={done ? 'text-foreground font-medium' : 'text-muted-foreground'}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Could not load application. <button onClick={() => refetch()} className="text-brand-orange">Try again</button></p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
