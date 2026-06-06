import { useState, useMemo } from "react";
import { Download, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { LogEntry } from "@/hooks/useLogs";

interface TerminalPanelProps {
  logs: LogEntry[];
  isLoading: boolean;
}

type SortKey = "timestamp" | "command" | "toolType" | "hostname";
type SortDir = "asc" | "desc";

const TOOL_COLORS: Record<string, string> = {
  git: "bg-primary/10 text-primary",
  npm: "bg-orange-500/10 text-orange-500",
  docker: "bg-blue-500/10 text-blue-500",
  python: "bg-yellow-500/10 text-yellow-600",
  other: "bg-muted text-muted-foreground",
};

function formatTime(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="inline w-3 h-3 ml-1 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="inline w-3 h-3 ml-1 text-primary" />
    : <ChevronDown className="inline w-3 h-3 ml-1 text-primary" />;
}

function TableSkeleton() {
  return (
    <div className="space-y-2 mt-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function TerminalPanel({ logs, isLoading }: TerminalPanelProps) {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<string>("all");

  const toolTypes = useMemo(
    () => ["all", ...Array.from(new Set(logs.map((l) => l.toolType))).sort()],
    [logs]
  );

  const sorted = useMemo(() => {
    const filtered = filter === "all" ? logs : logs.filter((l) => l.toolType === filter);
    return [...filtered].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [logs, filter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleExport() {
    const csv = [
      ["timestamp", "command", "toolType", "hostname", "cwd"].join(","),
      ...sorted.map((l) =>
        [l.timestamp, `"${l.command.replace(/"/g, '""')}"`, l.toolType, l.hostname, `"${l.cwd}"`].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devpulse-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "timestamp", label: "TIME" },
    { key: "command", label: "COMMAND" },
    { key: "toolType", label: "TOOL" },
    { key: "hostname", label: "HOST" },
  ];

  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Commands</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading ? "Loading…" : `${sorted.length} entries`}
            {!isLoading && logs.length > 0 && ` · latest: ${formatTime(
              [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0].timestamp
            )}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tool filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-muted border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            {toolTypes.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t === "all" ? "All tools" : t}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            disabled={isLoading || sorted.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No commands recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left py-2 font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.slice(0, 50).map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <td className="py-2.5 text-muted-foreground whitespace-nowrap pr-4">
                    {formatTime(log.timestamp)}
                  </td>
                  <td className="py-2.5 text-foreground font-mono max-w-xs truncate pr-4" title={log.command}>
                    {log.command}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                        TOOL_COLORS[log.toolType] ?? TOOL_COLORS.other
                      }`}
                    >
                      {log.toolType}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">
                    {log.hostname || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length > 50 && (
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              Showing 50 of {sorted.length} entries · use Export CSV to get all
            </p>
          )}
        </div>
      )}
    </div>
  );
}
