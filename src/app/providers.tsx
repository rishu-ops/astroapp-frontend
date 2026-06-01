'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { PostConsultationReviewModal } from '@/components/review/PostConsultationReviewModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      <PostConsultationReviewModal />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
