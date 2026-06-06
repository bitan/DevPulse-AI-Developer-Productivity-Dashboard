import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useLogs } from "@/hooks/useLogs";
import { Star, StarOff, Copy, Check } from "lucide-react";

const STORAGE_KEY = "devpulse_favorites";

function loadFavs(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function saveFavs(favs: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favs))); } catch { /* ignore */ }
}

const TOOL_COLORS: Record<string, string> = {
  git:    "bg-primary/10 text-primary",
  npm:    "bg-orange-500/10 text-orange-500",
  docker: "bg-blue-500/10 text-blue-500",
  python: "bg-yellow-500/10 text-yellow-600",
  other:  "bg-muted text-muted-foreground",
};

export default function Favorites() {
  const { logs, isLoading } = useLogs();
  const [favs, setFavs] = useState<Set<string>>(loadFavs);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { saveFavs(favs); }, [favs]);

  const toggle = (cmd: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(cmd) ? next.delete(cmd) : next.add(cmd);
      return next;
    });
  };

  const copyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 1500);
  };

  // Unique commands from log history, sorted by frequency
  const uniqueCommands = isLoading
    ? []
    : Array.from(
        logs.reduce<Map<string, { command: string; toolType: string; count: number }>>((map, l) => {
          const key = l.command;
          const existing = map.get(key);
          if (existing) existing.count++;
          else map.set(key, { command: l.command, toolType: l.toolType, count: 1 });
          return map;
        }, new Map()).values()
      ).sort((a, b) => b.count - a.count);

  const favoriteCommands = uniqueCommands.filter((c) => favs.has(c.command));
  const otherCommands    = uniqueCommands.filter((c) => !favs.has(c.command));

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary fill-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pin your most-used commands for quick access
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-surface p-4 flex gap-3">
                <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Pinned */}
            {favoriteCommands.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Pinned ({favoriteCommands.length})
                </p>
                {favoriteCommands.map((item) => (
                  <CommandRow
                    key={item.command}
                    item={item}
                    pinned
                    copied={copied === item.command}
                    onToggle={() => toggle(item.command)}
                    onCopy={() => copyCmd(item.command)}
                  />
                ))}
              </div>
            )}

            {/* All commands */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                {favoriteCommands.length > 0 ? "All Commands" : "Commands"} ({otherCommands.length})
              </p>
              {otherCommands.length === 0 && favoriteCommands.length === 0 && (
                <div className="card-surface p-10 text-center text-sm text-muted-foreground">
                  No commands yet. Run some with the CLI and they'll appear here.
                </div>
              )}
              {otherCommands.map((item) => (
                <CommandRow
                  key={item.command}
                  item={item}
                  pinned={false}
                  copied={copied === item.command}
                  onToggle={() => toggle(item.command)}
                  onCopy={() => copyCmd(item.command)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function CommandRow({
  item,
  pinned,
  copied,
  onToggle,
  onCopy,
}: {
  item: { command: string; toolType: string; count: number };
  pinned: boolean;
  copied: boolean;
  onToggle: () => void;
  onCopy: () => void;
}) {
  return (
    <div className={`card-surface px-4 py-3 flex items-center gap-3 group ${pinned ? "border-primary/20" : ""}`}>
      <button
        onClick={onToggle}
        aria-label={pinned ? "Unpin command" : "Pin command"}
        className={`shrink-0 transition-colors ${pinned ? "text-primary" : "text-muted-foreground/40 hover:text-primary"}`}
      >
        {pinned
          ? <Star className="w-4 h-4 fill-primary" />
          : <Star className="w-4 h-4" />}
      </button>

      <code className="flex-1 text-xs font-mono text-foreground truncate">{item.command}</code>

      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${TOOL_COLORS[item.toolType] ?? TOOL_COLORS.other}`}>
        {item.toolType}
      </span>

      <span className="text-[10px] text-muted-foreground shrink-0 w-12 text-right">
        ×{item.count}
      </span>

      <button
        onClick={onCopy}
        aria-label="Copy command"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
