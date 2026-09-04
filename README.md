# Collage Media Builder — Staffbase Custom Widget

A landscape (1920×1080) collage/media builder that runs as a Staffbase Custom Widget.
Editors design an image from layout templates, then publish it: the widget uploads the
rendered PNG to the **Media API** and adds it to a **File Manager collection** they pick
from a dropdown.

Built on `@staffbase/widget-sdk` — the bundle self-registers via `window.defineBlock(...)`.
The whole UI renders inside a **Shadow DOM**, so it can't collide with the host page's styles.

## Project layout

```
collage-widget/
├── package.json
├── tsconfig.json
├── webpack.config.js
└── src/
    ├── index.ts                 # defineBlock() registration + config → attributes
    ├── configuration-schema.ts  # admin config dialog (base URL, token, default collection)
    ├── api.ts                   # Media API + File Management API client
    ├── builder.ts               # the builder UI + canvas export + publish flow
    └── styles.ts                # all CSS (injected into the Shadow DOM)
```

## Build

```bash
npm install
npm run build      # → dist/chriscelle.collage-media-builder.js
```

Dev preview (serves the bundle + shows config dialog and end-user view):

```bash
npm start          # http://localhost:9000
```

## Install into a Staffbase instance

The built bundle is published two ways:

- **Auto-updating (recommended for iteration)** — GitHub Pages, one stable URL that
  reflects every push within ~10 minutes (no version bump needed):
  ```
  https://cdcruz-sbse.github.io/collage-media-builder-widget/dist/chriscelle.collage-media-builder.js
  ```
- **Pinned/immutable (recommended for production)** — a tagged jsDelivr URL that never
  changes under you; bump the tag to upgrade deliberately:
  ```
  https://cdn.jsdelivr.net/gh/cdcruz-sbse/collage-media-builder-widget@v0.2.0/dist/chriscelle.collage-media-builder.js
  ```

1. In **Staffbase Studio → Settings → Custom widgets**, paste one of the bundle URLs above
   under **Widget Bundle** → **Install**.
3. Add the "Collage Media Builder" widget to a News post or Page.
4. In the widget's config dialog, fill in:
   - **API base URL** — e.g. `https://your-tenant.staffbase.com/api`
   - **API token** — a Staffbase **EDITORIAL** token (used as HTTP Basic auth). File Manager
     writes reject *administrative* tokens with 403, and the token must have access to the target
     collection — easiest if that same token **created** the collection (it's auto-added to the
     collection's `adminIds`/`accessorIds`).
   - **Default collection ID** *(optional)* — pre-selects a collection at publish time

### Token scopes (important)

Staffbase "administrative" and "editorial" tokens are **separate scopes, not a hierarchy**:

| Call the widget makes | Required scope |
|---|---|
| `POST /media` (upload) | any valid token |
| `GET /medialibrary/collections` (list) | editorial |
| `PUT /medialibrary/entries/{id}` (register) | **editorial** |
| `POST /medialibrary/collections/{id}/entries` (add) | **editorial** + collection admin access |

Use one **editorial** token for the whole flow.

## Languages (manual, multi-language)

The **Translate** tab lets one design carry multiple languages. It's **manual** — you enter
each language's wording yourself — so it needs no backend and works anywhere.

Workflow: pick a source language (labels "Original") → **Add a language** creates a variant
(seeded from the original text) and a language chip. Select a chip, then click a text layer
and edit its wording for that language. Switch between **Original / <language>** chips;
whichever is active is what **Download PNG** / **Publish** exports (filename suffixed, e.g.
`collage-de.png`). Original stays intact.

> Why manual: Staffbase's `/api/translations` is an internal front-end endpoint (not a public
> API) that only authenticates from a logged-in user session — a custom widget can't call it
> reliably (returns 403). For **automatic** translation, put a small backend proxy in front of a
> real provider (DeepL / Azure / Google) and call that from the widget; `src/api.ts` is the place
> to add a `translate()` that hits your proxy.

## API calls it makes (all authenticated with `Authorization: Basic <token>`)

| Step | Method & path |
|---|---|
| List collections | `GET /medialibrary/collections?limit=200` (falls back to `…/all`) |
| Create collection (optional) | `POST /medialibrary/collections` `{ name }` |
| Upload image | `POST /media` (multipart: `file` + `metadata`) |
| Add to collection | `POST /medialibrary/collections/{collectionId}/entries` `{ entries: [mediumId] }` |

> The separate `PUT /medialibrary/entries/{mediumId}` "register" step is **not** used — the
> spec doesn't require it and it was failing with a 40308 ownership denial. The medium is added
> straight to the collection. The token must have **admin access to the target collection**;
> creating a collection with that token (the "create new collection" option in the Publish
> dialog) auto-grants it, guaranteeing the add succeeds.

## ⚠️ Security: the token is NOT secret at runtime

Staffbase delivers widget configuration to the **browser** as DOM attributes on the widget
element. The password mask in the config dialog only hides the value *while typing* — at
runtime any employee who can view the widget can read the token via dev tools, and the same
token is served to every viewer.

Because this token is used for uploads, treat it accordingly:
- Use the **most tightly-scoped token** your tenant allows.
- Prefer a **backend proxy**: put the *proxy URL* in the widget config instead of the token,
  keep the token in the proxy's server environment, and have the widget POST the PNG to the
  proxy. `src/api.ts` is structured so only the `baseUrl` + the two POST targets would change.

## CORS note

The Media/File Management calls work when the widget runs on the **same tenant origin** as
the configured base URL. Pointing at a *different* tenant may be blocked by CORS — use a
proxy in that case.

## Notes / limitations

- Config values arrive as element attributes named `api-base-url`, `api-token`,
  `default-collection-id` (kebab-case), read in `index.ts`.
- The builder logic is framework-agnostic (`mountCollageBuilder`), so it's easy to reuse or
  wrap in React later if the team standardizes on the generated React scaffold.
- This project was authored without a local Node toolchain to compile-check; run
  `npm install && npm run build` once to confirm in your environment.
