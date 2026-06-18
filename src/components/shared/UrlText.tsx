import { text, textMuted } from "../../lib/colors";
import { hostname } from "../../lib/utils";

interface UrlTextProps {
  url: string;
  style?: React.CSSProperties;
}

export const UrlText: React.FC<UrlTextProps> = ({ url, style }) => {
  const host = hostname(url);

  return (
    <div
      style={{
        fontFamily: "Inter, DM Sans, system-ui, sans-serif",
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        ...style,
      }}
    >
      <span style={{ fontSize: 20, color: textMuted, letterSpacing: "0.04em" }}>
        audit report for
      </span>
      <span
        style={{
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: text,
        }}
      >
        {host}
      </span>
    </div>
  );
};
