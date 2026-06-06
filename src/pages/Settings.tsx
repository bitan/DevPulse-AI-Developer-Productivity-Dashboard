import { useState, FormEvent } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  User, Key, Palette, Download, Trash2,
  Copy, Eye, EyeOff, Check, Save, Sun, Moon,
} from "lucide-react";

// Settings gets log count from a lightweight re-export so it doesn't
// trigger a second Firestore fetch — the Dashboard already fetches.
// We use localStorage-cached count, falling back to 0.
function useLogCount(): number {
  try {
    const raw = localStorage.getItem("devpulse_log_count");
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const logCount = useLogCount();

  // Profile form — initialised from live user context
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  // API key
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
    ? `dpls_sk_${(import.meta.env.VITE_FIREBASE_API_KEY as string).slice(0, 24)}`
    : "dpls_sk_••••• (set VITE_FIREBASE_API_KEY)";

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    // Update AuthContext — topbar name/avatar refresh immediately
    updateUser({ name: (displayName.trim() || user?.name) ?? "", email: (email.trim() || user?.email) ?? "" });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    // Pull raw logs from localStorage cache written by useLogs
    let rows: string[] = [];
    try {
      const cached = localStorage.getItem("devpulse_logs_cache");
      if (cached) {
        const logs = JSON.parse(cached) as Array<Record<string, string>>;
        rows = logs.map((l) =>
          [l.timestamp, `"${(l.command ?? "").replace(/"/g, '""')}"`, l.toolType, l.hostname, `"${l.cwd ?? ""}"`].join(",")
        );
      }
    } catch { /* ignore */ }

    const csv = [["timestamp", "command", "toolType", "hostname", "cwd"].join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devpulse-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDeleteAccount() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    logout();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        {/* ── Profile ──────────────────────────────────────────────────── */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {(displayName || user?.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "—"}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="display-name" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Display Name
                </label>
                <input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label htmlFor="profile-email" className="text-xs font-medium text-muted-foreground mb-1 block">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {profileSaved
                ? <><Check className="w-4 h-4" aria-hidden="true" /> Saved</>
                : <><Save className="w-4 h-4" aria-hidden="true" /> Save Profile</>
              }
            </button>
          </form>
        </div>

        {/* ── API Keys ──────────────────────────────────────────────────── */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-5">
            <Key className="w-4 h-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">API Keys</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Use this key with the <code className="font-mono">devpulse-track</code> CLI via{" "}
            <code className="font-mono">FIREBASE_API_KEY</code>.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
            <code className="flex-1 text-xs font-mono text-muted-foreground overflow-hidden truncate">
              {showKey ? apiKey : "dpls_sk_••••••••••••••••••••••••"}
            </code>
            <button
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
            <button
              onClick={copyKey}
              aria-label="Copy API key"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* ── Appearance ────────────────────────────────────────────────── */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-4 h-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
            </div>
            <div className="flex gap-2" role="group" aria-label="Theme selection">
              <button
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  theme === "dark"
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Moon className="w-3.5 h-3.5" aria-hidden="true" /> Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  theme === "light"
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Sun className="w-3.5 h-3.5" aria-hidden="true" /> Light
              </button>
            </div>
          </div>
        </div>

        {/* ── Data Export ───────────────────────────────────────────────── */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-4 h-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">Data Export</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Download all your tracked commands as a CSV file{logCount > 0 ? ` (${logCount} entries)` : ""}.
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-muted border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export Commands as CSV
          </button>
        </div>

        {/* ── Danger Zone ───────────────────────────────────────────────── */}
        <div className="card-surface p-6 border-destructive/30">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {confirmDelete
              ? "Are you sure? This will log you out and clear all local data. Click confirm to proceed."
              : "Log out and clear all locally stored session data."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteAccount}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                confirmDelete
                  ? "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
                  : "bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20"
              }`}
            >
              {confirmDelete ? "Confirm — Log me out" : "Delete Session & Log Out"}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-lg bg-muted border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
