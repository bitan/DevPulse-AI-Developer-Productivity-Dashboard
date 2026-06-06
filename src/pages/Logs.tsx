import DashboardLayout from "@/components/DashboardLayout";
import TerminalPanel from "@/components/dashboard/TerminalPanel";
import { useLogs } from "@/hooks/useLogs";

export default function Logs() {
  const { logs, isLoading } = useLogs();

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All commands tracked by devpulse-track
          </p>
        </div>
        <TerminalPanel logs={logs} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
