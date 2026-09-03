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
  return { Authorization: `Basic ${token}`, Accept: "application/json" };
}

async function ensureOk(res: Response, label: string): Promise<void> {
  if (res.ok) return;
  throw new Error(`${label} failed — ${describe(res, await safeText(res))}`);
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ""; }
}

/** Turn a bad/unexpected response into an actionable message. */
function describe(res: Response, body: string): string {
  const ct = res.headers.get("content-type") || "";
  const looksLikeHtml = ct.includes("text/html") || /^\s*<(?:!doctype|html)/i.test(body);
  const where = res.url ? ` [${res.url}]` : "";
  const redir = res.redirected
    ? ` The request was redirected to ${res.url} — the token was likely rejected and sent to a login page.`
    : "";
  if (looksLikeHtml) {
    return `the server returned an HTML page (HTTP ${res.status})${where}, not JSON.${redir} ` +
      `Confirm the base URL includes "/api" exactly once and the token is a valid Staffbase API token.`;
  }
  if (res.status === 401 || res.status === 403) {
    return `authentication was rejected (HTTP ${res.status})${where}. Check the API token and its access level.`;
  }
  return `HTTP ${res.status} ${res.statusText}${where}${body ? ": " + body.slice(0, 200) : ""}`;
}

/** Read a response as JSON, but fail loudly (and helpfully) if it isn't JSON. */
async function readJson(res: Response, label: string): Promise<any> {
  const ct = res.headers.get("content-type") || "";
  const text = await safeText(res);
  if (!res.ok || !ct.includes("application/json")) {
    throw new Error(`${label} failed — ${describe(res, text)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} failed — the response was not valid JSON.`);
  }
}

/**
 * List File Manager collections.
 * Admin tokens can see every collection via `/medialibrary/collections/all`;
 * editorial tokens only work on `/medialibrary/collections`. We try `/all`
 * first and fall back to the editorial path if it's rejected (401/403).
 */
export async function listCollections(cfg: ApiConfig): Promise<Collection[]> {
  let res = await fetch(`${cfg.baseUrl}/medialibrary/collections/all?limit=200`, {
    headers: authHeaders(cfg.token),
  });
  if (res.status === 401 || res.status === 403) {
    res = await fetch(`${cfg.baseUrl}/medialibrary/collections?limit=200`, {
      headers: authHeaders(cfg.token),
    });
  }
  const data = await readJson(res, "Loading collections");
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
  const m = await readJson(res, "Uploading image");
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
