interface ToolsChartProps {
  toolUsage: { tool: string; count: number }[];
  isLoading: boolean;
}

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 h-3 rounded bg-muted animate-pulse" />
      <div className="flex-1 h-2 rounded-full bg-muted animate-pulse" />
      <div className="w-8 h-3 rounded bg-muted animate-pulse" />
    </div>
  );
}

export default function ToolsChart({ toolUsage, isLoading }: ToolsChartProps) {
  const maxCount = Math.max(...toolUsage.map((t) => t.count), 1);
  // Use a floor of 20% so even the smallest bar is visible,
  // but scale the rest proportionally between that floor and 100%
  const BAR_MIN = 8;
  const barWidth = (count: number) => BAR_MIN + ((count / maxCount) * (100 - BAR_MIN));

  return (
    <div className="card-surface p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Tool Usage</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Frequency of commands per tool type
      </p>
      <div className="space-y-2.5 mt-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
        ) : (
          toolUsage.map((row) => (
            <div key={row.tool} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20 truncate capitalize">
                {row.tool}
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${barWidth(row.count)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-8 text-right">
                {formatCount(row.count)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
