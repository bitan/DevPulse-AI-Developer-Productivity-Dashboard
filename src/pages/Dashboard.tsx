import DashboardLayout from "@/components/DashboardLayout";
import StatsCards from "@/components/dashboard/StatsCards";
import ProductivityChart from "@/components/dashboard/ProductivityChart";
import ToolsChart from "@/components/dashboard/ToolsChart";
import TerminalPanel from "@/components/dashboard/TerminalPanel";
import { useLogs } from "@/hooks/useLogs";

export default function Dashboard() {
  const logsState = useLogs();

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Live data badge */}
        {!logsState.isLoading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  logsState.isLive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    logsState.isLive ? "bg-primary animate-pulse" : "bg-muted-foreground"
                  }`}
                />
                {logsState.isLive ? "Live — Firestore" : "Static snapshot"}
              </span>
            </div>

            {/* Firestore error — show a clean dismissible banner, not raw text */}
            {logsState.error && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive max-w-2xl">
                <span className="mt-0.5 shrink-0">⚠</span>
                <div className="min-w-0">
                  <p className="font-semibold mb-1">Firestore connection failed — showing static data</p>
                  {logsState.error.includes("SERVICE_DISABLED") || logsState.error.includes("has not been used") ? (
                    <p className="text-destructive/80">
                      The Firestore API is not enabled.{" "}
                      <a
                        href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${import.meta.env.VITE_FIREBASE_PROJECT_ID ?? ""}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-medium hover:text-destructive"
                      >
                        Enable it in Google Cloud Console ↗
                      </a>
                      , then restart the dev server and refresh.
                    </p>
                  ) : logsState.error.includes("PERMISSION_DENIED") ? (
                    <p className="text-destructive/80">
                      Firestore security rules are blocking reads.{" "}
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-medium hover:text-destructive"
                      >
                        Open Firebase Console ↗
                      </a>
                      {" → Firestore Database → Rules → set "}
                      <code className="font-mono bg-destructive/10 px-1 rounded">allow read: if true</code>
                      {" on the collection, then refresh."}
                    </p>
                  ) : logsState.error.includes("INVALID_API_KEY") ? (
                    <p className="text-destructive/80">
                      Your <code className="font-mono bg-destructive/10 px-1 rounded">VITE_FIREBASE_API_KEY</code> is invalid.
                      Copy the Web API Key from Firebase Console → Project Settings, update <code className="font-mono bg-destructive/10 px-1 rounded">.env</code>, restart the server.
                    </p>
                  ) : logsState.error.includes("NOT_FOUND") ? (
                    <p className="text-destructive/80">
                      Collection not found. Check that <code className="font-mono bg-destructive/10 px-1 rounded">VITE_FIREBASE_COLLECTION</code> in your <code className="font-mono bg-destructive/10 px-1 rounded">.env</code> matches the collection your CLI writes to.
                    </p>
                  ) : (
                    <p className="text-destructive/80 break-words">{logsState.error}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <StatsCards stats={logsState.stats} isLoading={logsState.isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductivityChart
              dailyActivity={logsState.dailyActivity}
              isLoading={logsState.isLoading}
            />
          </div>
          <ToolsChart
            toolUsage={logsState.toolUsage}
            isLoading={logsState.isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TerminalPanel logs={logsState.logs} isLoading={logsState.isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
