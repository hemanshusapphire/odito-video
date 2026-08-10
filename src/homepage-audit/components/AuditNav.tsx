import type { FC } from 'react';

interface AuditNavData {
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  badgeText?: string;
}

interface AuditNavProps {
  data?: AuditNavData;
  translateY?: number;
}

export const AuditNav: FC<AuditNavProps> = ({ data = {}, translateY = 0 }) => {
  const {
    brandName   = 'odito',
    brandSuffix = 'ai',
    pageLabel   = 'Website Audit',
    badgeText   = 'Scan Completed',
  } = data;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 36px', height: 66,
      background: '#070c1e', borderBottom: '1px solid #131a35',
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Left: logo + separator + page label */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>{brandName}</span>
        <span style={{ fontSize: 21, fontWeight: 800, color: '#fff' }}>.</span>
        <span style={{
          fontSize: 19, fontWeight: 800,
          background: 'linear-gradient(90deg,#00c8ff,#7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>{brandSuffix}</span>
        <div style={{ width: 1, height: 24, background: '#1e2848', margin: '0 16px' }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: '#8090b8' }}>{pageLabel}</span>
      </div>

      {/* Right: scan badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        border: '1.5px solid #22c55e', borderRadius: 100,
        padding: '7px 16px',
        fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '0.2px',
      }}>
        {badgeText}
        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="none" stroke="#22c55e" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  );
};
