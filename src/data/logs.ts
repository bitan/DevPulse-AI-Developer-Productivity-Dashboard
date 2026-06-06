export interface LogEntry {
  id: string;
  command: string;
  toolType: string;
  timestamp: string;
  hostname: string;
  cwd: string;
}

export const DEVPULSE_LOGS: LogEntry[] = [
  { id: "073ICCSBAp4azePBQXBu", command: "git pull origin main", toolType: "git", timestamp: "2026-02-12T09:52:09.314Z", hostname: "Nabi", cwd: "" },
  { id: "35rSfhrDLz2LgF82NZ7b", command: "docker images", toolType: "docker", timestamp: "2026-02-12T10:57:53.084Z", hostname: "Nabi", cwd: "" },
  { id: "4KKkxrexUJ35enS0Jdl5", command: "npm outdated", toolType: "npm", timestamp: "2026-02-12T09:58:44.604Z", hostname: "Nabi", cwd: "" },
  { id: "4dMZfC8FDbSFMh108pUY", command: "docker exec -it my-db bash", toolType: "docker", timestamp: "2026-02-12T11:04:10.955Z", hostname: "Nabi", cwd: "" },
  { id: "4qkLXs1LAVsIZB1w7FD6", command: "npm run test:e2e", toolType: "npm", timestamp: "2026-02-12T10:05:36.001Z", hostname: "Nabi", cwd: "" },
  { id: "6qfjujDryAeowKzVlowB", command: "git push origin main", toolType: "git", timestamp: "2026-02-12T09:55:04.227Z", hostname: "Nabi", cwd: "" },
  { id: "8Wi4nQ6DXLS6O5XzCLhk", command: "node index.js", toolType: "other", timestamp: "2026-02-12T09:58:26.744Z", hostname: "Nabi", cwd: "" },
  { id: "8yh63wnfTaYxS22tvRSj", command: "npm test", toolType: "npm", timestamp: "2026-02-12T09:50:42.680Z", hostname: "Nabi", cwd: "" },
  { id: "9N4nOTplwmhpNahpq9sf", command: "docker compose logs -f", toolType: "docker", timestamp: "2026-02-12T11:02:47.175Z", hostname: "Nabi", cwd: "" },
  { id: "B1LVD7uRvZQPCMnMNo5Z", command: "git log --oneline -5", toolType: "git", timestamp: "2026-02-12T09:48:41.285Z", hostname: "Nabi", cwd: "" },
  { id: "BosxsAlElturScYsIbdb", command: "git commit", toolType: "git", timestamp: "2026-02-11T18:54:48.162Z", hostname: "Nabi", cwd: "" },
  { id: "ETIPpwJhw59il1oOFW4b", command: "docker logs my-app", toolType: "docker", timestamp: "2026-02-12T10:59:07.255Z", hostname: "Nabi", cwd: "" },
  { id: "EzciKZGE63DdggbCpLuA", command: "npm run typecheck", toolType: "npm", timestamp: "2026-02-12T10:06:59.284Z", hostname: "Nabi", cwd: "" },
  { id: "HNkufLl2BmfrnSKzwIP5", command: "npm test -- --watch", toolType: "npm", timestamp: "2026-02-12T09:59:43.066Z", hostname: "Nabi", cwd: "" },
  { id: "J1JChlJaEXWHiPZS0ha6", command: "npm run format", toolType: "npm", timestamp: "2026-02-12T09:57:41.892Z", hostname: "Nabi", cwd: "" },
  { id: "JmDJHrET8VDNorfeILNB", command: "npm run build", toolType: "npm", timestamp: "2026-02-12T09:49:19.951Z", hostname: "Nabi", cwd: "" },
  { id: "L0ahkMePmnkQCFDR8QN3", command: "git commit", toolType: "git", timestamp: "2026-02-11T18:41:27.369Z", hostname: "Nabi", cwd: "" },
  { id: "MBrPVx0h54f6HEmy0jg7", command: "git branch", toolType: "git", timestamp: "2026-02-12T09:51:03.702Z", hostname: "Nabi", cwd: "" },
  { id: "NFUfPRis3t4g2ylXJv1r", command: "docker ps", toolType: "docker", timestamp: "2026-02-12T10:57:37.812Z", hostname: "Nabi", cwd: "" },
  { id: "OXDOd6Vr84WGc0hGOvvK", command: "git commit -m 'WIP: experimenting with devpulse-track'", toolType: "git", timestamp: "2026-02-12T09:54:33.964Z", hostname: "Nabi", cwd: "" },
  { id: "OfwsAusaKUB4gZWqE2tl", command: "npm test -- --runInBand", toolType: "npm", timestamp: "2026-02-12T10:04:48.341Z", hostname: "Nabi", cwd: "" },
  { id: "Os9xTn9mhPX9HXupJI0p", command: "npm run dev", toolType: "npm", timestamp: "2026-02-12T09:56:03.548Z", hostname: "Nabi", cwd: "" },
  { id: "RD40XZ5knpzt44vQA14W", command: "npm install", toolType: "npm", timestamp: "2026-02-12T09:55:35.886Z", hostname: "Nabi", cwd: "" },
  { id: "VZsui5ixzLNQwLOdhgeq", command: "docker system prune -f", toolType: "docker", timestamp: "2026-02-12T11:05:33.005Z", hostname: "Nabi", cwd: "" },
  { id: "WlxDBGoKFcT3WweVrsSC", command: "run --rm my-app:latest", toolType: "other", timestamp: "2026-02-12T11:02:02.882Z", hostname: "Nabi", cwd: "" },
  { id: "YTadpv37rcOAPLVmmZUf", command: "npx playwright test", toolType: "other", timestamp: "2026-02-12T10:08:03.902Z", hostname: "Nabi", cwd: "" },
  { id: "YgyaP4URKWgQT5H6HLHV", command: "docker compose up", toolType: "docker", timestamp: "2026-02-12T09:49:51.142Z", hostname: "Nabi", cwd: "" },
  { id: "YmFtS7XcSOMoDEWGhKO8", command: "npm run test:unit", toolType: "npm", timestamp: "2026-02-12T10:05:11.571Z", hostname: "Nabi", cwd: "" },
  { id: "ZqNumdrRZev12MRkxN0E", command: "git stash list", toolType: "git", timestamp: "2026-02-12T09:55:23.565Z", hostname: "Nabi", cwd: "" },
  { id: "ZsEfEn2TxtFlXW0uFz51", command: "test command", toolType: "other", timestamp: "2026-02-12T08:03:12.072Z", hostname: "Nabi", cwd: "" },
  { id: "fEk5sTGIL9R0OXVovMuf", command: "git checkout main", toolType: "git", timestamp: "2026-02-12T09:51:30.457Z", hostname: "Nabi", cwd: "" },
  { id: "icofFi9PGnsgAMJog3ZX", command: "npx jest auth.spec.ts", toolType: "other", timestamp: "2026-02-12T10:07:31.326Z", hostname: "Nabi", cwd: "" },
  { id: "k1AvFJWLzKXTuDi6qbOO", command: "git add", toolType: "git", timestamp: "2026-02-12T09:52:21.658Z", hostname: "Nabi", cwd: "" },
  { id: "lLUpOWo689bFmnamVmvT", command: "test command", toolType: "other", timestamp: "2026-02-12T08:58:31.865Z", hostname: "Nabi", cwd: "" },
  { id: "leKH8raO822FYaTD53ii", command: "npm run storybook", toolType: "npm", timestamp: "2026-02-12T09:59:13.034Z", hostname: "Nabi", cwd: "" },
  { id: "nNSWYJHj46rha6A9L0Sz", command: "docker compose up", toolType: "docker", timestamp: "2026-02-12T10:58:10.768Z", hostname: "Nabi", cwd: "" },
  { id: "oFMuDxubh7WVrI2ClaRK", command: "docker compose down", toolType: "docker", timestamp: "2026-02-12T10:58:44.424Z", hostname: "Nabi", cwd: "" },
  { id: "oaEvoLzQnN4qd56ahrQC", command: "npm run lint:fix", toolType: "npm", timestamp: "2026-02-12T10:06:04.878Z", hostname: "Nabi", cwd: "" },
  { id: "pClmOLkhbinYW85H8VBm", command: "npm run lint", toolType: "npm", timestamp: "2026-02-12T09:56:59.142Z", hostname: "Nabi", cwd: "" },
  { id: "pe7TUe4VAGDNXp70qxKB", command: "git diff", toolType: "git", timestamp: "2026-02-12T09:48:02.081Z", hostname: "Nabi", cwd: "" },
  { id: "ro16AQBJY1cFap8AUMAx", command: "npm run coverage", toolType: "npm", timestamp: "2026-02-12T10:06:28.892Z", hostname: "Nabi", cwd: "" },
  { id: "tMc3qFee4kwucErXrPCF", command: "node server.js", toolType: "other", timestamp: "2026-02-12T09:58:08.390Z", hostname: "Nabi", cwd: "" },
  { id: "tOie4NfMfd6DGtADPbBU", command: "npx cypress run", toolType: "other", timestamp: "2026-02-12T10:56:09.350Z", hostname: "Nabi", cwd: "" },
  { id: "ulMYIanVXENm97jiliLM", command: "build -t my-app:latest .", toolType: "other", timestamp: "2026-02-12T11:00:13.238Z", hostname: "Nabi", cwd: "" },
];

export function buildDailyActivity(logs: LogEntry[]): { date: string; commands: number }[] {
  const byDate = logs.reduce<Record<string, { date: string; commands: number }>>((acc, log) => {
    if (!log.timestamp) return acc;
    const date = log.timestamp.slice(0, 10);
    if (!acc[date]) acc[date] = { date, commands: 0 };
    acc[date].commands += 1;
    return acc;
  }, {});
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildToolUsage(logs: LogEntry[]): { tool: string; count: number }[] {
  const byTool = logs.reduce<Record<string, { tool: string; count: number }>>((acc, log) => {
    const tool = log.toolType || "other";
    if (!acc[tool]) acc[tool] = { tool, count: 0 };
    acc[tool].count += 1;
    return acc;
  }, {});
  return Object.values(byTool).sort((a, b) => b.count - a.count);
}
