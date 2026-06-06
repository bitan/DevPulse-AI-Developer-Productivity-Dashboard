import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProductivityChartProps {
  dailyActivity: { date: string; commands: number }[];
  isLoading: boolean;
}

function ChartSkeleton() {
  return (
    <div className="h-56 flex items-end gap-1 px-2">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-muted animate-pulse"
          style={{ height: `${30 + Math.random() * 60}%`, animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
}

export default function ProductivityChart({ dailyActivity, isLoading }: ProductivityChartProps) {
  return (
    <div className="card-surface p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">Daily Coding Activity</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Number of tracked commands per day from devpulse-track
      </p>

      {isLoading ? (
        <ChartSkeleton />
      ) : dailyActivity.length < 3 ? (
        <div className="h-56 min-h-[224px] flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">Not enough data yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Run{" "}
            <code className="font-mono bg-muted px-1 rounded text-[10px]">devpulse-track "git status"</code>
            {" "}a few times to start seeing your activity chart.
          </p>
        </div>
      ) : (
        <div className="h-56 min-h-[224px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyActivity} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                stroke="hsl(0 0% 55%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(0 0% 55%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="commands"
                stroke="hsl(0 72% 51%)"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(0 72% 51%)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
