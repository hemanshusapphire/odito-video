import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { smooth } from "../../lib/easing";
import { CountUp } from "../motion/CountUp";
import { FadeIn } from "../motion/FadeIn";
import { ScaleIn } from "../motion/ScaleIn";
import { StaggerChildren } from "../motion/StaggerChildren";
import { StarRating } from "./StarRating";
import { InfoRow } from "./InfoRow";
import { surface, border, text, textMuted } from "../../lib/colors";
import { hostname } from "../../lib/utils";

const GBP_GREEN = "#22C55E";

interface GBPCardProps {
  businessName: string;
  category?: string;
  rating: number;
  reviewCount: number;
  address?: string;
  phone?: string;
  website?: string;
  delay?: number;
}

export const GBPCard: React.FC<GBPCardProps> = ({
  businessName,
  category,
  rating,
  reviewCount,
  address,
  phone,
  website,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ frame: Math.max(0, frame - delay), fps, config: smooth });
  const opacity = Math.min(cardIn * 2, 1);
  const translateY = (1 - cardIn) * 20;

  const infoItems = [
    address ? { icon: "📍", text: address } : null,
    phone   ? { icon: "📞", text: phone }   : null,
    website ? { icon: "🌐", text: hostname(website) } : null,
  ].filter(Boolean) as Array<{ icon: string; text: string }>;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: surface,
        border: `1px solid ${GBP_GREEN}40`,
        borderRadius: 24,
        padding: "36px 40px",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "Inter, DM Sans, system-ui, sans-serif",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FadeIn delay={delay + 8} translateY={12}>
            <div style={{ fontSize: 32, fontWeight: 800, color: text, lineHeight: 1.1, wordBreak: "break-word" }}>
              {businessName}
            </div>
          </FadeIn>
          {category && (
            <FadeIn delay={delay + 16} translateY={8}>
              <div style={{ fontSize: 18, color: textMuted, marginTop: 8 }}>{category}</div>
            </FadeIn>
          )}
        </div>

        {/* Verified badge */}
        <ScaleIn delay={delay + 24}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: GBP_GREEN + "15",
              border: `1px solid ${GBP_GREEN}40`,
              borderRadius: 12,
              padding: "10px 20px",
            }}
          >
            <span style={{ fontSize: 18, color: GBP_GREEN }}>✓</span>
            <span style={{ fontSize: 14, color: GBP_GREEN, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Verified
            </span>
          </div>
        </ScaleIn>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: border, marginBottom: 28 }} />

      {/* Rating row */}
      <FadeIn delay={delay + 30} translateY={8}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#FBBF24", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            <CountUp to={rating} delay={delay + 30} decimals={1} />
          </div>
          <StarRating rating={rating} delay={delay + 30} size={30} />
          <div style={{ fontSize: 20, color: textMuted }}>
            {reviewCount.toLocaleString()} reviews
          </div>
        </div>
      </FadeIn>

      {/* Info rows */}
      {infoItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StaggerChildren initialDelay={delay + 48} staggerDelay={10}>
            {infoItems.map((item, i) => (
              <InfoRow key={i} icon={item.icon} text={item.text} />
            ))}
          </StaggerChildren>
        </div>
      )}
    </div>
  );
};
