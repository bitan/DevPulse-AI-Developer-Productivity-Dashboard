import { Terminal, CalendarDays, Wrench, Monitor } from "lucide-react";

interface Stats {
  totalCommands: number;
  activeDays: number;
  topTool: string;
  uniqueHosts: number;
}

interface StatsCardsProps {
  stats: Stats;
  isLoading: boolean;
}

function Skeleton() {
  return <div className="h-7 w-20 rounded-md bg-muted animate-pulse" />;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Commands",
      value: formatNumber(stats.totalCommands),
      sub: "tracked by devpulse-track",
      icon: Terminal,
    },
    {
      label: "Active Days",
      value: String(stats.activeDays),
      sub: "days with recorded activity",
      icon: CalendarDays,
    },
    {
      label: "Top Tool",
      value: stats.topTool,
      sub: "most used tool type",
      icon: Wrench,
    },
    {
      label: "Machines",
      value: String(stats.uniqueHosts),
      sub: "unique hostnames tracked",
      icon: Monitor,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card-surface p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <card.icon className="w-4 h-4 text-primary" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton />
          ) : (
            <p className="text-2xl font-bold text-foreground capitalize">{card.value}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
