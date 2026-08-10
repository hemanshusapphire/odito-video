import type { FC, ReactElement } from 'react';

// ── Star rendering ────────────────────────────────────────────────────────────

const STAR_PTS = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2';

const StarFull: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#f5c518" stroke="none">
    <polygon points={STAR_PTS} />
  </svg>
);

const StarHalf: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="gbp-star-half" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" stopColor="#f5c518" />
        <stop offset="50%" stopColor="rgba(255,255,255,.12)" />
      </linearGradient>
    </defs>
    <polygon points={STAR_PTS} fill="url(#gbp-star-half)" stroke="none" />
  </svg>
);

const StarEmpty: FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,.12)" stroke="none">
    <polygon points={STAR_PTS} />
  </svg>
);

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        if (fill >= 0.75) return <StarFull key={i} />;
        if (fill >= 0.25) return <StarHalf key={i} />;
        return <StarEmpty key={i} />;
      })}
    </div>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────

const ROW_ICONS: Record<string, ReactElement> = {
  address: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c6cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c6cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.19h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.86-.95a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.03z" />
    </svg>
  ),
  website: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7ab0f8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#7c6cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

function InfoRow({
  iconType, label, value, isWebsite = false,
}: { iconType: string; label: string; value: string; isWebsite?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: '#1a1640', border: '1px solid #2a256a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {ROW_ICONS[iconType]}
      </div>
      <div style={{ width: 106, fontSize: 12.5, color: '#6b7a9e', flexShrink: 0 }}>{label}</div>
      <div style={{
        flex: 1, fontSize: 13.5,
        color: isWebsite ? '#7ab0f8' : '#e8eaf0',
        wordBreak: 'break-all',
      }}>
        {value}
      </div>
      {isWebsite && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#6b7a9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LocalBusinessProfileCardProps {
  businessName: string;
  category?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  website?: string;
  businessHours?: string;
  opacity?: number;
  translateX?: number;
}

export const LocalBusinessProfileCard: FC<LocalBusinessProfileCardProps> = ({
  businessName,
  category      = '',
  verified      = true,
  rating        = 0,
  reviewCount   = 0,
  address       = '',
  phone         = '',
  website       = '',
  businessHours = '',
  opacity       = 1,
  translateX    = 0,
}) => (
  <div style={{
    background: '#10121f',
    border: '1px solid #1e1d34',
    borderRadius: 16,
    padding: '24px 22px',
    display: 'flex', flexDirection: 'column', gap: 18,
    opacity,
    transform: `translateX(${translateX}px)`,
  }}>
    {/* Top row: icon circle + business info */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
      {/* Icon circle */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3730a3 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,.92)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        {verified && (
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            width: 26, height: 26, borderRadius: '50%',
            background: '#22c55e', border: '2.5px solid #10121f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <polyline points="2,6 5,9 10,3" fill="none" stroke="white"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Business name + category + verified */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
          {businessName}
        </div>
        {category && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(99,102,241,.2)', border: '1px solid rgba(99,102,241,.4)',
            borderRadius: 6, padding: '3px 11px',
            fontSize: 12, fontWeight: 500, color: '#a5b4fc',
          }}>
            {category}
          </div>
        )}
        {verified && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#22c55e' }}>Verified Business</span>
          </div>
        )}
      </div>
    </div>

    {/* Rating */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ fontSize: 46, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-1.5px' }}>
        {rating.toFixed(1)}
      </div>
      <Stars rating={rating} />
      <div style={{ fontSize: 14, color: '#6b7a9e', marginLeft: 4 }}>
        {reviewCount.toLocaleString()} Reviews
      </div>
    </div>

    {/* Divider */}
    <div style={{ height: 1, background: '#1e1d34' }} />

    {/* Info rows */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {address       && <InfoRow iconType="address" label="Address"        value={address}        />}
      {phone         && <InfoRow iconType="phone"   label="Phone"          value={phone}          />}
      {website       && <InfoRow iconType="website" label="Website"        value={website}        isWebsite />}
      {businessHours && <InfoRow iconType="clock"   label="Business Hours" value={businessHours}  />}
    </div>
  </div>
);
