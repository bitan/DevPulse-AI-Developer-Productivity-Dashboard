/**
 * Lightweight Firestore REST client for the browser.
 * Uses the same REST API the CLI uses — no Firebase SDK needed.
 *
 * Reads are public (no auth header) so Firestore security rules must allow
 * read access for the collection, or you can add an API key via env var.
 */

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const COLLECTION = (import.meta.env.VITE_FIREBASE_COLLECTION as string | undefined) ?? "devpulse_commands";
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

function isConfigured(): boolean {
  return Boolean(PROJECT_ID);
}

function buildCollectionUrl(): string {
  let url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    PROJECT_ID!
  )}/databases/(default)/documents/${encodeURIComponent(COLLECTION)}`;

  if (API_KEY) url += `?key=${encodeURIComponent(API_KEY)}`;
  return url;
}

// ─── Firestore value types ────────────────────────────────────────────────────

type FirestoreValue =
  | { stringValue: string }
  | { doubleValue: number }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string };

type FirestoreFields = Record<string, FirestoreValue>;

interface FirestoreDocument {
  name: string;
  fields: FirestoreFields;
  createTime: string;
  updateTime: string;
}

interface FirestoreListResponse {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
}

function extractValue(v: FirestoreValue): string | number | boolean | null {
  if ("stringValue" in v) return v.stringValue;
  if ("doubleValue" in v) return v.doubleValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  return null;
}

function docToObject(doc: FirestoreDocument): Record<string, unknown> & { id: string } {
  const id = doc.name.split("/").pop() ?? doc.name;
  const obj: Record<string, unknown> = { id };
  for (const [key, val] of Object.entries(doc.fields ?? {})) {
    obj[key] = extractValue(val);
  }
  return obj as Record<string, unknown> & { id: string };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export { isConfigured };

/**
 * Fetch all documents from the devpulse_commands collection.
 * Paginates automatically to retrieve the full dataset.
 * Returns null if the project is not configured (no env vars).
 */
export async function fetchAllLogs(): Promise<
  (Record<string, unknown> & { id: string })[] | null
> {
  if (!isConfigured()) return null;

  const all: (Record<string, unknown> & { id: string })[] = [];
  let pageToken: string | undefined;

  do {
    // Build URL — API key goes as first query param, pageToken appended after
    const base = buildCollectionUrl();
    const separator = base.includes("?") ? "&" : "?";
    const url = pageToken ? `${base}${separator}pageToken=${encodeURIComponent(pageToken)}` : base;

    const res = await fetch(url);
    if (!res.ok) {
      // Parse the JSON error body for a clean message
      let message = `HTTP ${res.status}`;
      try {
        const err = await res.json() as { error?: { message?: string; status?: string } };
        const status = err?.error?.status ?? "";
        const detail = err?.error?.message ?? "";

        if (status === "SERVICE_DISABLED" || detail.includes("SERVICE_DISABLED") || detail.includes("has not been used")) {
          message = "SERVICE_DISABLED: Firestore API is not enabled for this project.";
        } else if (status === "PERMISSION_DENIED" || res.status === 403) {
          message = "PERMISSION_DENIED: Firestore security rules are blocking reads. Open Firebase Console → Firestore → Rules and allow read access for the collection.";
        } else if (res.status === 400 && detail.includes("API key")) {
          message = "INVALID_API_KEY: The VITE_FIREBASE_API_KEY value is invalid. Copy the Web API Key from Firebase Console → Project Settings.";
        } else if (res.status === 404) {
          message = "NOT_FOUND: Collection not found. Check that VITE_FIREBASE_COLLECTION matches the collection your CLI writes to (default: devpulse_commands).";
        } else {
          message = detail || `HTTP ${res.status}`;
        }
      } catch {
        message = `HTTP ${res.status} — could not parse error response`;
      }
      throw new Error(message);
    }

    const data: FirestoreListResponse = await res.json();
    if (data.documents) {
      all.push(...data.documents.map(docToObject));
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return all;
}
