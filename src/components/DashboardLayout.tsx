import { ReactNode, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, ScrollText, Sparkles,
  Settings, Search, Bell, Star, Menu, X, LogOut,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { useLogs } from "@/hooks/useLogs";

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",   path: "/dashboard" },
  { icon: FolderKanban,    label: "Projects",     path: "/projects" },
  { icon: ScrollText,      label: "Logs",         path: "/logs" },
  { icon: Sparkles,        label: "AI Insights",  path: "/insights" },
  { icon: Star,            label: "Favorites",    path: "/favorites" },
  { icon: Settings,        label: "Settings",     path: "/settings" },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects":  "Projects",
  "/logs":      "Logs",
  "/insights":  "AI Insights",
  "/favorites": "Favorites",
  "/settings":  "Settings",
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center py-4 gap-1 h-full">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mb-4 shrink-0">
        <span className="text-primary-foreground font-bold text-sm">D</span>
      </div>

      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => { navigate(item.path); onNavigate?.(); }}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors group relative
              ${active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="absolute left-12 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border shadow-sm">
              {item.label}
            </span>
          </button>
        );
      })}

      <div className="mt-auto shrink-0">
        <button
          onClick={() => { logout(); navigate("/login", { replace: true }); onNavigate?.(); }}
          aria-label="Logout"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors group relative text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="absolute left-12 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border shadow-sm">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Search overlay ───────────────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { logs } = useLogs();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const q = query.trim().toLowerCase();

  // Search nav pages
  const pageResults = navItems.filter((n) => n.label.toLowerCase().includes(q));

  // Search command history
  const cmdResults = q
    ? logs
        .filter((l) => l.command.toLowerCase().includes(q))
        .slice(0, 8)
    : [];

  const hasResults = pageResults.length > 0 || cmdResults.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages or commands…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!q && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              Start typing to search pages and command history
            </div>
          )}

          {q && !hasResults && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No results for "{query}"
            </div>
          )}

          {q && pageResults.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Pages
              </p>
              {pageResults.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {q && cmdResults.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Commands
              </p>
              {cmdResults.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { navigate("/logs"); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left"
                >
                  <code className="flex-1 text-xs font-mono text-foreground truncate">{l.command}</code>
                  <span className="text-[10px] text-muted-foreground shrink-0">{l.toolType}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications panel ─────────────────────────────────────────────────────
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { logs } = useLogs();

  // Build notifications from real log data
  const recent = [...logs]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  function formatAgo(iso: string) {
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const m = Math.floor(diff / 60000);
      const h = Math.floor(m / 60);
      const d = Math.floor(h / 24);
      if (d > 0) return `${d}d ago`;
      if (h > 0) return `${h}h ago`;
      if (m > 0) return `${m}m ago`;
      return "just now";
    } catch { return ""; }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-10 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-xs text-muted-foreground text-center">
              No activity yet
            </p>
          ) : (
            recent.map((l) => (
              <div key={l.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <code className="text-xs font-mono text-foreground truncate block">{l.command}</code>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {l.toolType} · {l.hostname} · {formatAgo(l.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-border">
          <button
            onClick={onClose}
            className="text-xs text-primary hover:underline"
          >
            View all in Logs →
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const notifRef = useRef<HTMLDivElement>(null);

  const pageTitle = PAGE_TITLES[location.pathname] ?? "DevPulse";

  // Keyboard shortcut: Cmd/Ctrl+K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside className="w-14 flex flex-col items-center bg-sidebar border-r border-sidebar-border shrink-0">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile drawer */}
      {isMobile && drawerOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="relative w-14 bg-sidebar border-r border-sidebar-border shrink-0 z-10">
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="absolute top-2 right-1 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground z-20"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main area — takes all remaining space */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card gap-4">
          <div className="flex items-center gap-2 text-sm shrink-0">
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mr-1"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <span className="text-primary font-semibold">● {pageTitle}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search — desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-muted-foreground w-52 hover:border-primary/40 hover:text-foreground transition-colors cursor-text"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Search Anything</span>
              <kbd className="text-[10px] border border-border rounded px-1 py-0.5 font-mono">⌘K</kbd>
            </button>

            {/* Search — mobile */}
            {isMobile && (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative ${
                  notifOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Bell className="w-4 h-4" />
                {/* unread dot */}
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              </button>
              {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* User */}
            <div className="flex items-center gap-2 ml-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-xs font-medium text-foreground truncate max-w-[100px]">{user?.name ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{user?.email ?? ""}</p>
              </div>
              <span className="hidden sm:inline text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border shrink-0">
                Free
              </span>
            </div>
          </div>
        </header>

        {/* Page content — full width, scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 w-full">
          {children}
        </main>
      </div>

      {/* Search overlay (portal-like, above everything) */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
