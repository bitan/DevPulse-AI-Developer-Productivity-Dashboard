import DashboardLayout from "@/components/DashboardLayout";
import { useLogs } from "@/hooks/useLogs";
import { Sparkles, TrendingUp, Clock, Zap, BarChart2 } from "lucide-react";

function getPeakHour(logs: ReturnType<typeof useLogs>["logs"]): string {
  if (!logs.length) return "—";
  const hours: Record<number, number> = {};
  for (const l of logs) {
    if (!l.timestamp) continue;
    const h = new Date(l.timestamp).getHours();
    hours[h] = (hours[h] ?? 0) + 1;
  }
  const peak = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
  if (!peak) return "—";
  const h = Number(peak[0]);
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
}

function getMostUsedCommand(logs: ReturnType<typeof useLogs>["logs"]): string {
  if (!logs.length) return "—";
  const counts: Record<string, number> = {};
  for (const l of logs) {
    const cmd = l.command.split(" ")[0];
    counts[cmd] = (counts[cmd] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

function getStreakDays(logs: ReturnType<typeof useLogs>["logs"]): number {
  if (!logs.length) return 0;
  const days = Array.from(new Set(logs.map((l) => l.timestamp.slice(0, 10)))).sort().reverse();
  let streak = 1;
  for (let i = 0; i < days.length - 1; i++) {
    const diff = (new Date(days[i]).getTime() - new Date(days[i + 1]).getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function getAvgCommandsPerDay(logs: ReturnType<typeof useLogs>["logs"]): string {
  if (!logs.length) return "0";
  const days = new Set(logs.map((l) => l.timestamp.slice(0, 10))).size;
  return (logs.length / days).toFixed(1);
}

export default function Insights() {
  const { logs, isLoading, toolUsage } = useLogs();

  const insights = [
    {
      icon: Clock,
      label: "Peak Hour",
      value: isLoading ? "—" : getPeakHour(logs),
      desc: "Most productive time of day",
    },
    {
      icon: Zap,
      label: "Top Command",
      value: isLoading ? "—" : getMostUsedCommand(logs),
      desc: "Most frequently run command",
    },
    {
      icon: TrendingUp,
      label: "Current Streak",
      value: isLoading ? "—" : `${getStreakDays(logs)}d`,
      desc: "Consecutive active days",
    },
    {
      icon: BarChart2,
      label: "Avg / Day",
      value: isLoading ? "—" : getAvgCommandsPerDay(logs),
      desc: "Average commands per active day",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Patterns and productivity metrics from your command history
            </p>
          </div>
        </div>

        {/* Insight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((ins) => (
            <div key={ins.label} className="card-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{ins.label}</p>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ins.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              {isLoading ? (
                <div className="h-7 w-24 rounded bg-muted animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-foreground font-mono">{ins.value}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">{ins.desc}</p>
            </div>
          ))}
        </div>

        {/* Tool breakdown */}
        <div className="card-surface p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Tool Breakdown</h2>
          <p className="text-xs text-muted-foreground mb-4">Percentage share of each tool type</p>
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 h-3 rounded bg-muted animate-pulse" />
                    <div className="flex-1 h-3 rounded bg-muted animate-pulse" />
                    <div className="w-10 h-3 rounded bg-muted animate-pulse" />
                  </div>
                ))
              : toolUsage.map((t) => {
                  const pct = logs.length ? Math.round((t.count / logs.length) * 100) : 0;
                  return (
                    <div key={t.tool} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground capitalize w-16 shrink-0">{t.tool}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-12 text-right">
                        {t.count} <span className="text-muted-foreground font-normal">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Recent activity heatmap — simplified hour grid */}
        <div className="card-surface p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Activity by Hour</h2>
          <p className="text-xs text-muted-foreground mb-4">Command distribution across hours of the day</p>
          {isLoading ? (
            <div className="h-12 rounded bg-muted animate-pulse" />
          ) : (
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 24 }, (_, h) => {
                const count = logs.filter((l) => l.timestamp && new Date(l.timestamp).getHours() === h).length;
                const max = Math.max(...Array.from({ length: 24 }, (_, i) =>
                  logs.filter((l) => l.timestamp && new Date(l.timestamp).getHours() === i).length
                ), 1);
                const intensity = Math.round((count / max) * 4);
                const bg = ["bg-muted", "bg-primary/20", "bg-primary/40", "bg-primary/70", "bg-primary"][intensity];
                return (
                  <div key={h} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-7 h-7 rounded-md ${bg} transition-all`}
                      title={`${h}:00 — ${count} command${count !== 1 ? "s" : ""}`}
                    />
                    <span className="text-[8px] text-muted-foreground">{h}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
