'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { offeringService } from '@/services/offering.service';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { X, IndianRupee, ExternalLink, Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Offering } from '@/types';

interface OfferingRecommendPanelProps {
  chatId: string;
  onClose: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  remedy: '🌿', puja: '🪔', chadhava: '🌸', gemstone: '💎',
  rudraksha: '📿', yantra: '🔯', report: '📊', service: '⭐',
  digital_product: '💻', other: '✨',
};

export function OfferingRecommendPanel({ chatId, onClose }: OfferingRecommendPanelProps) {
  const [recommending, setRecommending] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-offerings-approved'],
    queryFn: () => offeringService.getMine({ reviewStatus: 'approved' }).then(r => r.data.data),
  });

  const approvedOfferings: Offering[] = data || [];

  const handleRecommend = async (offering: Offering) => {
    setRecommending(offering._id);
    try {
      await api.post('/messages/recommend', { chatId, offeringId: offering._id });
      setSuccess(offering._id);
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1200);
    } catch {
      // fail silently — socket will handle delivery
    } finally {
      setRecommending(null);
    }
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-brand-orange" />
          <span className="font-bold text-sm">Recommend an Offering</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
          <X className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="max-h-64">
        {isLoading ? (
          <div className="flex justify-center py-6"><LoadingSpinner /></div>
        ) : approvedOfferings.length === 0 ? (
          <div className="flex flex-col items-center py-8 px-4 text-center gap-3">
            <Package className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-muted-foreground">No approved offerings yet</p>
            <p className="text-xs text-muted-foreground">Create offerings and get them approved to recommend</p>
            <Link href="/astrologer/offerings" onClick={onClose}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" /> Manage Offerings
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {approvedOfferings.map((offering) => (
              <div key={offering._id} className="flex items-center gap-3 p-3 hover:bg-muted/30">
                <div className="h-12 w-12 rounded-lg bg-brand-orange/10 flex items-center justify-center text-xl shrink-0">
                  {offering.thumbnail ? (
                    <img src={offering.thumbnail} alt="" className="h-full w-full object-cover rounded-lg" />
                  ) : CATEGORY_EMOJI[offering.category] || '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{offering.title}</p>
                  <p className="text-xs text-muted-foreground">{offering.category}</p>
                  <p className="text-xs font-bold text-brand-orange flex items-center gap-0.5">
                    <IndianRupee className="h-3 w-3" />{offering.price}
                  </p>
                </div>
                <Button
                  size="sm"
                  className={`shrink-0 gap-1.5 text-xs font-bold ${
                    success === offering._id
                      ? 'bg-green-500 text-white border-0'
                      : 'orange-gradient border-0 text-white'
                  }`}
                  onClick={() => handleRecommend(offering)}
                  disabled={!!recommending || success === offering._id}
                >
                  {recommending === offering._id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : success === offering._id ? '✓ Sent' : 'Recommend'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
