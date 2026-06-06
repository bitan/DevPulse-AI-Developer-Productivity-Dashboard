import { useState, useEffect } from "react";
import { fetchAllLogs, isConfigured } from "@/lib/firestore";
import { DEVPULSE_LOGS, LogEntry, buildDailyActivity, buildToolUsage } from "@/data/logs";

export type { LogEntry };

export interface LogsState {
  logs: LogEntry[];
  isLive: boolean;       // true = data came from Firestore, false = static fallback
  isLoading: boolean;
  error: string | null;
  dailyActivity: { date: string; commands: number }[];
  toolUsage: { tool: string; count: number }[];
  stats: {
    totalCommands: number;
    activeDays: number;
    topTool: string;
    uniqueHosts: number;
  };
}

function castToLogEntry(raw: Record<string, unknown> & { id: string }): LogEntry {
  return {
    id: raw.id,
    command: String(raw.command ?? ""),
    toolType: String(raw.toolType ?? "other"),
    timestamp: String(raw.timestamp ?? ""),
    hostname: String(raw.hostname ?? ""),
    cwd: String(raw.cwd ?? ""),
  };
}

function computeStats(logs: LogEntry[]) {
  const activeDays = new Set(logs.map((l) => l.timestamp.slice(0, 10))).size;
  const toolCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.toolType] = (acc[l.toolType] ?? 0) + 1;
    return acc;
  }, {});
  const topTool = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const uniqueHosts = new Set(logs.map((l) => l.hostname).filter(Boolean)).size;

  return { totalCommands: logs.length, activeDays, topTool, uniqueHosts };
}

export function useLogs(): LogsState {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // If no env vars are set, skip the fetch entirely and use the static data
      if (!isConfigured()) {
        if (!cancelled) {
          setLogs(DEVPULSE_LOGS);
          setIsLive(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const raw = await fetchAllLogs();
        if (cancelled) return;

        if (raw && raw.length > 0) {
          const entries = raw.map(castToLogEntry);
          setLogs(entries);
          setIsLive(true);
          // Cache for Settings export and count display
          try {
            localStorage.setItem("devpulse_logs_cache", JSON.stringify(entries));
            localStorage.setItem("devpulse_log_count", String(entries.length));
          } catch { /* storage full — ignore */ }
        } else {
          // Firestore returned empty — fall back to static data
          setLogs(DEVPULSE_LOGS);
          setIsLive(false);
        }
      } catch (err) {
        if (cancelled) return;
        // Firestore error — fall back gracefully, surface the error
        setLogs(DEVPULSE_LOGS);
        setIsLive(false);
        setError(err instanceof Error ? err.message : "Failed to load live data");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const dailyActivity = buildDailyActivity(logs);
  const toolUsage = buildToolUsage(logs);
  const stats = computeStats(logs);

  return { logs, isLive, isLoading, error, dailyActivity, toolUsage, stats };
}
