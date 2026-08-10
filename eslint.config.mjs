import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    // Remotion requires inline styles for frame-derived animation values.
    // External CSS cannot hold per-frame computed values like opacity or transform.
    rules: {
      // Remotion requires inline styles for per-frame animation values.
      "react/forbid-component-props": "off",
      "react/forbid-dom-props": "off",
      "@remotion/no-inline-styles": "off",
    },
  },
];
