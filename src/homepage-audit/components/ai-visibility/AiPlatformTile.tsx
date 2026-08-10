import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import { AI_PLATFORM_ASSETS, VISIBILITY_COLORS } from '../../assets/aiPlatforms';

interface AiPlatformTileProps {
  platformType: string;
  name: string;
  /** Visibility level — "Low" | "Medium" | "High" */
  visibility?: string;
  opacity?: number;
  translateY?: number;
}

export const AiPlatformTile: FC<AiPlatformTileProps> = ({
  platformType,
  name,
  visibility  = 'Low',
  opacity     = 1,
  translateY  = 0,
}) => {
  const asset      = AI_PLATFORM_ASSETS[platformType];
  const logoBg     = asset?.logoBg     ?? '#111220';
  const logoBorder = asset?.logoBorder ?? '#1e1d34';
  const visColor   = VISIBILITY_COLORS[visibility] ?? '#ef4444';

  return (
    <div style={{
      background: '#111220',
      border: '1px solid #1e1d34',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
      opacity,
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Platform logo */}
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: logoBg,
        border: `1px solid ${logoBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {asset?.imagePath ? (
          <Img
            src={staticFile(asset.imagePath)}
            width={28}
            height={28}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          // Inline fallback for platforms without a raster asset
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="11" stroke="#a855f7" strokeWidth="1.5" />
            <text x="14" y="19" textAnchor="middle"
              fontFamily="system-ui,sans-serif" fontSize="10" fontWeight="700" fill="#a855f7">
              AI
            </text>
          </svg>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f0eef8' }}>{name}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: visColor }}>
          Visibility: {visibility}
        </div>
      </div>
    </div>
  );
};
