import React from "react";
import { Img, staticFile } from "remotion";

interface PlatformNodeProps {
  name: string;
  /** Image size in px. Default 96. */
  size?: number;
}

const PLATFORM_CONFIG: Record<string, { logo: string }> = {
  ChatGPT:    { logo: "ai-platforms/chatgpt.png" },
  Claude:     { logo: "ai-platforms/claude.png" },
  Gemini:     { logo: "ai-platforms/gemini.png" },
  Perplexity: { logo: "ai-platforms/perplexity-ai.png" },
  Bing:       { logo: "ai-platforms/bing.png" },
};

export const PlatformNode: React.FC<PlatformNodeProps> = ({ name, size = 96 }) => {
  const cfg = PLATFORM_CONFIG[name];
  if (!cfg) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Img
        src={staticFile(cfg.logo)}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "rgba(255,255,255,0.92)",
          fontFamily: "sans-serif",
          whiteSpace: "nowrap",
          textAlign: "center",
          letterSpacing: "-0.01em",
          textShadow: "0 1px 8px rgba(0,0,0,0.6)",
        }}
      >
        {name}
      </div>
    </div>
  );
};
