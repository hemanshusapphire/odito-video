import type { FC } from 'react';
import { Img, staticFile } from 'remotion';
import { SOCIAL_PLATFORM_ASSETS } from '../assets/socialPlatforms';

interface SocialPlatformCardProps {
  platformType: string;
  name: string;
  connected: boolean;
  opacity?: number;
  translateY?: number;
}

export const SocialPlatformCard: FC<SocialPlatformCardProps> = ({
  platformType,
  name,
  connected,
  opacity    = 1,
  translateY = 0,
}) => {
  const asset = SOCIAL_PLATFORM_ASSETS[platformType];
  const logoBg     = asset?.logoBg     ?? '#111220';
  const logoBorder = asset?.logoBorder ?? '#1e1d34';

  return (
    <div style={{
      background: '#111220',
      border: '1px solid #1e1d34',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      opacity,
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Platform logo */}
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: logoBg,
        border: `1px solid ${logoBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {asset?.imagePath ? (
          <Img
            src={staticFile(asset.imagePath)}
            width={26}
            height={26}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          // Fallback initials
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7a9e' }}>
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Platform name */}
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#f0eef8' }}>
        {name}
      </div>

      {/* Status badge */}
      {connected ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#071610',
          border: '1px solid #14532d',
          borderRadius: 20,
          padding: '4px 12px',
          flexShrink: 0,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#22c55e' }}>Connected</span>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#111220',
          border: '1px solid #2a2a40',
          borderRadius: 20,
          padding: '4px 12px',
          flexShrink: 0,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3a3a58' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#5a597a' }}>Not Connected</span>
        </div>
      )}
    </div>
  );
};
