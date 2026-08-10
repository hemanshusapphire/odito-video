import type { FC, ReactNode } from 'react';

interface FindingsListProps {
  header?: string;
  children: ReactNode;
  opacity?: number;
  translateY?: number;
}

export const FindingsList: FC<FindingsListProps> = ({
  header      = 'Top Findings',
  children,
  opacity     = 1,
  translateY  = 0,
}) => (
  <div style={{
    background: '#111526',
    border: '1px solid #1a2240',
    borderRadius: 12,
    padding: '16px 18px',
    opacity,
    transform: `translateY(${translateY}px)`,
  }}>
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
      textTransform: 'uppercase', color: '#6b7a9e',
      marginBottom: 4,
    }}>
      {header}
    </div>
    {children}
  </div>
);
