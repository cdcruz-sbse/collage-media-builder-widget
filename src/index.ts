import { configurationSchema, uiSchema } from "./configuration-schema";
import { mountCollageBuilder, WidgetConfig } from "./builder";

// Keep in sync with package.json (imported as literals to avoid TS rootDir issues).
const VERSION = "0.1.0";
const AUTHOR = "chriscelle";

/**
 * The platform injects `window.defineBlock` at runtime. We call it once on load
 * so the bundle self-registers the custom widget.
 */
declare global {
  interface Window {
    defineBlock: (widget: any) => void;
  }
}

function readConfig(el: HTMLElement): WidgetConfig {
  return {
    baseUrl: normalizeBaseUrl(el.getAttribute("api-base-url") || ""),
    token: (el.getAttribute("api-token") || "").trim(),
    defaultCollectionId: (el.getAttribute("default-collection-id") || "").trim(),
  };
}

/**
 * Normalize the configured base URL. Staffbase REST calls live under `/api`,
 * so if the admin entered only a bare origin (e.g. https://tenant.staffbase.com)
 * we append `/api`. If they already gave a path (…/api, or a proxy path), we keep it.
 */
function normalizeBaseUrl(raw: string): string {
  let b = raw.trim().replace(/\/+$/, "");
  if (!b) return b;
  try {
    const u = new URL(b);
    if (u.pathname === "" || u.pathname === "/") b = u.origin + "/api";
  } catch {
    /* not a full URL — leave as-is */
  }
  return b;
}

// BlockFactory: (Base, widgetApi) => CustomElementConstructor
const factory = (BaseBlockClass: any, _widgetApi: any) =>
  class CollageBlock extends BaseBlockClass {
    // Rendered on a live page.
    renderBlock(container: HTMLElement): void {
      mountCollageBuilder(container, readConfig(this as unknown as HTMLElement));
    }
    // Rendered inside the page editor (WYSIWYG preview) — same experience.
    renderBlockInEditor(container: HTMLElement): void {
      mountCollageBuilder(container, readConfig(this as unknown as HTMLElement));
    }
  };

const externalBlockDefinition = {
  blockDefinition: {
    name: "collage-media-builder",
    factory,
    attributes: ["api-base-url", "api-token", "default-collection-id"],
    configurationSchema,
    uiSchema,
    label: "Collage Media Builder",
  },
  version: VERSION,
  author: AUTHOR,
};

window.defineBlock(externalBlockDefinition);
