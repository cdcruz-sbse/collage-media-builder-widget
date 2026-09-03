/**
 * Thin client for the Staffbase Media API + File Management API.
 *
 * Endpoints & shapes verified against the official OpenAPI specs:
 *   - GET  /medialibrary/collections            (list collections)
 *   - POST /media                               (upload, multipart)
 *   - PUT  /medialibrary/entries/{mediumId}     (register uploaded medium into File Manager)
 *   - POST /medialibrary/collections/{id}/entries  (add medium to a collection)
 *
 * Auth: HTTP Basic with the raw API token, i.e. `Authorization: Basic <token>`.
 *
 * NOTE ON CORS: these calls succeed when the widget runs on the same tenant origin
 * as `baseUrl`. Pointing at a *different* tenant may be blocked by CORS — in that
 * case route the calls through a backend proxy instead.
 */

export interface Collection {
  id: string;
  name: string;
  mediumCount?: number;
}

export interface UploadedMedium {
  id: string;
  url?: string;
}

export interface ApiConfig {
  baseUrl: string; // e.g. https://tenant.staffbase.com/api (no trailing slash)
  token: string;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Basic ${token}` };
}

async function ensureOk(res: Response, label: string): Promise<void> {
  if (res.ok) return;
  let detail = "";
  try {
    detail = (await res.text()).slice(0, 300);
  } catch {
    /* ignore */
  }
  throw new Error(`${label} failed (${res.status} ${res.statusText})${detail ? ": " + detail : ""}`);
}

/** List File Manager collections for the token's branch. */
export async function listCollections(cfg: ApiConfig): Promise<Collection[]> {
  const res = await fetch(`${cfg.baseUrl}/medialibrary/collections?limit=200`, {
    headers: authHeaders(cfg.token),
  });
  await ensureOk(res, "Loading collections");
  const data = await res.json();
  return (data.entries || []).map((e: any) => ({
    id: e.id,
    name: e.name,
    mediumCount: e.mediumCount,
  }));
}

/** Upload a rendered PNG blob to the Media API. Returns the new medium id + url. */
export async function uploadMedia(
  cfg: ApiConfig,
  blob: Blob,
  fileName: string
): Promise<UploadedMedium> {
  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("metadata", JSON.stringify({ type: "image", fileName }));

  const res = await fetch(`${cfg.baseUrl}/media`, {
    method: "POST",
    headers: authHeaders(cfg.token), // do NOT set Content-Type; the browser sets the multipart boundary
    body: form,
  });
  await ensureOk(res, "Uploading image");
  const m = await res.json();
  return { id: m.id, url: m?.resourceInfo?.url };
}

/** Register the uploaded medium into the File Manager, then add it to a collection. */
export async function addToCollection(
  cfg: ApiConfig,
  collectionId: string,
  mediumId: string
): Promise<void> {
  const reg = await fetch(`${cfg.baseUrl}/medialibrary/entries/${mediumId}`, {
    method: "PUT",
    headers: authHeaders(cfg.token),
  });
  // 204 No Content on success; treat any 2xx as ok.
  await ensureOk(reg, "Registering media");

  const add = await fetch(`${cfg.baseUrl}/medialibrary/collections/${collectionId}/entries`, {
    method: "POST",
    headers: { ...authHeaders(cfg.token), "Content-Type": "application/json" },
    body: JSON.stringify({ entries: [mediumId] }),
  });
  await ensureOk(add, "Adding to collection");
}
