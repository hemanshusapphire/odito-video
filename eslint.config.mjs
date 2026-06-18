import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  {
    // Remotion requires inline styles for frame-derived animation values.
    // External CSS cannot hold per-frame computed values like opacity or transform.
    rules: {
      "react/forbid-component-props": "off",
    },
  },
];
