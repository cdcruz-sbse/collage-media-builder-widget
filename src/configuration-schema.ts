// Lightweight local types (avoid depending on the SDK's nested type packages).
type JSONSchema = Record<string, any>;
type UiSchema = Record<string, any>;

/**
 * Admin configuration dialog (react-jsonschema-form, rendered by the platform).
 *
 * Property keys are declared in kebab-case so they map 1:1 to the custom-element
 * attributes we read at runtime (see index.ts `attributes` + `getAttribute`).
 *
 * ⚠️ SECURITY: Values entered here are delivered to the employee's browser as DOM
 * attributes on the widget element. `"ui:widget": "password"` ONLY masks the field
 * in this editor — it does NOT keep the value secret at runtime. Anyone who can view
 * the widget can read the token via dev tools. Use a tightly-scoped token, or move
 * the upload behind a backend proxy and put the proxy URL here instead of the token.
 */
export const configurationSchema: JSONSchema = {
  type: "object",
  required: ["api-base-url", "api-token"],
  properties: {
    "api-base-url": {
      type: "string",
      title: "API base URL",
      description: "Destination tenant API root, e.g. https://your-tenant.staffbase.com/api",
    },
    "api-token": {
      type: "string",
      title: "API token",
      description: "Staffbase API token used for uploads (sent as HTTP Basic auth).",
    },
    "default-collection-id": {
      type: "string",
      title: "Default collection ID (optional)",
      description: "Pre-selects a File Manager collection. Users can still pick another at upload time.",
    },
  },
};

export const uiSchema: UiSchema = {
  "api-base-url": {
    "ui:help": "Example: https://your-tenant.staffbase.com/api",
  },
  "api-token": {
    "ui:widget": "password",
    "ui:help":
      "⚠ Delivered to the browser at runtime — this is NOT truly secret. Use a scoped token or a backend proxy.",
  },
  "default-collection-id": {
    "ui:help": "Optional. Leave blank to let users choose a collection when they publish.",
  },
};
