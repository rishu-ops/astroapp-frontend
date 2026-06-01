'use client';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Users, Star, MessageCircle, Wifi, Activity, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const STAT_CONFIG = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/users' },
  { key: 'pendingApplications', label: 'Pending Review', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/applications' },
  { key: 'totalChats', label: 'Total Chats', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50', link: '/admin/chats' },
  { key: 'onlineAstrologers', label: 'Online Now', icon: Wifi, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/applications' },
  { key: 'activeChats', label: 'Active Chats', icon: Activity, color: 'text-brand-orange', bg: 'bg-orange-50', link: '/admin/chats' },
] as const;

const QUICK_LINKS = [
  { label: 'Review Applications', desc: 'Approve or reject astrologer applications', href: '/admin/applications', color: 'border-l-amber-500' },
  { label: 'Manage Users', desc: 'Block or unblock user accounts', href: '/admin/users', color: 'border-l-blue-500' },
  { label: 'Monitor Chats', desc: 'View all ongoing conversations', href: '/admin/chats', color: 'border-l-green-500' },
  { label: 'Panchang Analytics', desc: 'View search volumes and city tracking stats', href: '/admin/panchang-analytics', color: 'border-l-purple-500' },
];


export default function AdminDashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics().then((r) => r.data.data),
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />

        <div className="bg-brand-navy text-white py-8">
          <div className="container">
            <h1 className="text-2xl md:text-3xl font-extrabold">Admin Dashboard</h1>
            <p className="text-white/50 mt-1 text-sm">NakshatraChat platform overview</p>
          </div>
        </div>

        <main className="flex-1 container py-8">
          {isLoading ? (
            <LoadingSpinner fullPage />
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, link }) => (
                  <Link key={key} href={link}>
                    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-border">
                      <CardContent className="p-5">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <p className="text-2xl font-extrabold text-brand-navy">
                          {analytics?.[key] ?? '—'}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Quick links */}
              <h2 className="text-lg font-bold text-brand-navy mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {QUICK_LINKS.map(({ label, desc, href, color }) => (
                  <Link key={label} href={href}>
                    <Card className={`hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border-l-4 ${color}`}>
                      <CardContent className="p-5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-brand-navy">{label}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
