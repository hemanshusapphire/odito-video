import type { FC } from 'react';

interface SectionDividerProps {
  label: string;
  opacity?: number;
}

export const SectionDivider: FC<SectionDividerProps> = ({ label, opacity = 1 }) => (
  <div style={{
    fontSize: 13, fontWeight: 700, letterSpacing: '2px',
    color: '#8090b8', textTransform: 'uppercase',
    paddingBottom: 10,
    borderBottom: '1px solid #131a35',
    opacity,
  }}>
    {label}
  </div>
);
