'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { adminService } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, getInitials } from '@/lib/utils';
import { Astrologer } from '@/types';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AdminAstrologersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-astrologers'],
    queryFn: () => adminService.getAstrologers().then((r) => r.data),
  });

  const block = useMutation({
    mutationFn: (id: string) => adminService.blockAstrologer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-astrologers'] }),
  });

  const unblock = useMutation({
    mutationFn: (id: string) => adminService.unblockAstrologer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-astrologers'] }),
  });

  const astrologers: Astrologer[] = data?.data || [];

  const statusBadge = (a: Astrologer) => {
    if (a.applicationStatus === 'approved' && a.profileStatus === 'live')
      return <Badge className="bg-green-100 text-green-700">Live</Badge>;
    if (a.applicationStatus === 'approved')
      return <Badge className="bg-blue-100 text-blue-700">Approved</Badge>;
    if (a.applicationStatus === 'under_review')
      return <Badge className="bg-amber-100 text-amber-700">Under Review</Badge>;
    if (a.applicationStatus === 'rejected')
      return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="outline">Registered</Badge>;
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">All Astrologers</h1>
            <a href="/admin/applications">
              <Button variant="outline" className="gap-2">
                Review Applications <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Astrologers ({data?.meta?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="divide-y">
                  {astrologers.map((a) => (
                    <div key={a.id || a._id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{getInitials(a.displayName || a.name)}</AvatarFallback>
                          </Avatar>
                          {a.isOnline && (
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{a.displayName || a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.email}</p>
                          <p className="text-xs text-muted-foreground">{a.primaryExpertise} · {a.experience} yrs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(a)}
                        {a.isBlocked ? (
                          <Button size="sm" variant="outline" onClick={() => unblock.mutate(a.id || a._id)} disabled={unblock.isPending}>Unblock</Button>
                        ) : (
                          <Button size="sm" variant="destructive" onClick={() => block.mutate(a.id || a._id)} disabled={block.isPending}>Block</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
