'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { usePanchangAdminAnalyticsQuery } from '@/hooks/usePanchang';
import { BarChart, Eye, Calendar, MapPin, TrendingUp, ChevronLeft, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminPanchangAnalyticsPage() {
  const { data: analytics, isLoading, error } = usePanchangAdminAnalyticsQuery();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
        <Navbar />

        {/* Header */}
        <div className="bg-brand-navy text-white py-8">
          <div className="container flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-white/60 hover:text-white text-xs font-semibold flex items-center gap-1 mb-2">
                <ChevronLeft className="h-3 w-3" /> Back to Dashboard
              </Link>
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
                <Activity className="h-6 w-6 text-brand-gold" />
                Panchang Usage Analytics
              </h1>
              <p className="text-white/50 mt-1 text-sm">Monitor searches, cities volume, and query frequencies</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 container py-8">
          {isLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : error || !analytics ? (
            <Card className="border-border p-8 text-center bg-white">
              <p className="text-muted-foreground font-semibold">Failed to fetch administrative metrics reports.</p>
            </Card>
          ) : (
            <div className="space-y-8">
              
              {/* Primary Stat Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <Card className="border-border shadow-sm bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <Eye className="h-6 w-6 text-brand-orange" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-brand-navy">{analytics.totalViews}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Total Panchang Views</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-brand-navy">{analytics.topCities.length}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Unique Cities Searched</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-brand-navy">{analytics.topDates.length}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Distinct Dates Searched</p>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Data Grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Most Viewed Dates */}
                <Card className="border-border shadow-sm bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-brand-navy flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-orange" />
                      Most Viewed Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {analytics.topDates.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">No date query analytics recorded yet.</p>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-slate-100">
                        <table className="w-full text-sm text-left text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3">Target Date</th>
                              <th className="px-4 py-3 text-right">View Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold">
                            {analytics.topDates.map((item, index) => (
                              <tr key={index} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-brand-navy font-bold">{item.date}</td>
                                <td className="px-4 py-3 text-right text-slate-700">{item.count} views</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Most Selected Cities */}
                <Card className="border-border shadow-sm bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-brand-navy flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      Most Selected Cities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {analytics.topCities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-4 text-center">No city queries recorded yet.</p>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-slate-100">
                        <table className="w-full text-sm text-left text-slate-600">
                          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3">City / Area Name</th>
                              <th className="px-4 py-3 text-right">Search Volume</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold">
                            {analytics.topCities.map((item, index) => (
                              <tr key={index} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-brand-navy font-bold">{item.cityName}</td>
                                <td className="px-4 py-3 text-right text-slate-700">{item.count} searches</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Trends Pattern Summary */}
              <Card className="border-border shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-brand-navy flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Daily Request Frequencies (Past 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analytics.dailyTrends.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-6 text-center">No request history recorded recently.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 pt-2">
                        {analytics.dailyTrends.map((item, index) => (
                          <div key={index} className="flex flex-col bg-slate-50 border border-slate-100 rounded-xl p-3 items-center min-w-[90px] hover:border-brand-orange hover:bg-orange-50/20 transition-all">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.date.split('-').slice(1).join('/')}</span>
                            <span className="text-base font-extrabold text-brand-navy mt-1">{item.count}</span>
                            <span className="text-[10px] text-slate-500 font-semibold mt-0.5">views</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
