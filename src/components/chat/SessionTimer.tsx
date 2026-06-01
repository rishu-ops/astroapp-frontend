'use client';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionTimerProps {
  startedAt: string;
  className?: string;
}

export function SessionTimer({ startedAt, className }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [startedAt]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  const fmt = (n: number) => String(n).padStart(2, '0');
  const display = h > 0 ? `${fmt(h)}:${fmt(m)}:${fmt(s)}` : `${fmt(m)}:${fmt(s)}`;

  return (
    <div className={cn('flex items-center gap-1.5 text-sm font-mono font-semibold', className)}>
      <Clock className="h-3.5 w-3.5" />
      {display}
    </div>
  );
}
