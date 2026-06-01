import { Star } from "lucide-react";

interface RatingDistributionProps {
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    average: number;
    total: number;
  };
}

export function RatingDistribution({ distribution }: RatingDistributionProps) {
  const rows = [5, 4, 3, 2, 1] as const;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Star className="w-8 h-8 fill-brand-orange text-brand-orange" />
          <span className="text-4xl font-extrabold text-brand-orange">
            {distribution.average.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {distribution.total} reviews
        </span>
      </div>

      <div className="w-full flex flex-col gap-2">
        {rows.map((star) => {
          const count = distribution[star];
          const percentage =
            distribution.total > 0 ? (count / distribution.total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2 w-full">
              <div className="flex items-center gap-1 w-8 shrink-0 justify-end">
                <span className="text-sm font-medium">{star}</span>
                <Star className="w-3.5 h-3.5 fill-brand-orange text-brand-orange" />
              </div>

              <div className="flex-1 bg-muted rounded h-2 overflow-hidden">
                <div
                  className="h-2 bg-brand-orange rounded transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="text-sm text-muted-foreground w-6 shrink-0 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

