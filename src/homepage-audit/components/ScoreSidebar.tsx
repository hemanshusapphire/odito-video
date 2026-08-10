import type { FC, ReactElement } from 'react';
import { CategoryScoreDial } from './CategoryScoreDial';

interface ScoreSidebarProps {
  // Dial
  score: number;
  maxScore?: number;
  progress: number;
  dialId?: string;
  gradStart?: string;
  gradMid?: string;
  gradEnd?: string;
  /** Dial size in px — passed through to CategoryScoreDial. Default 220. */
  size?: number;

  // Text below dial
  label: string;
  subtitle?: string;

  // Label fade animation (computed in scene, passed down)
  labelOpacity?: number;

  // Optional content rendered below subtitle (screen-specific extras)
  footerContent?: ReactElement;
}

export const ScoreSidebar: FC<ScoreSidebarProps> = ({
  score,
  maxScore    = 100,
  progress,
  dialId      = 'sidebar',
  gradStart,
  gradMid,
  gradEnd,
  size        = 220,
  label,
  subtitle,
  labelOpacity = 1,
  footerContent,
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }}>
    <CategoryScoreDial
      score={score}
      maxScore={maxScore}
      progress={progress}
      id={dialId}
      gradStart={gradStart}
      gradMid={gradMid}
      gradEnd={gradEnd}
      size={size}
    />

    {/* Section label */}
    <div style={{
      marginTop: 20,
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: '#fff',
      textAlign: 'center',
      opacity: labelOpacity,
    }}>
      {label}
    </div>

    {/* Subtitle */}
    {subtitle && (
      <div style={{
        marginTop: 7,
        fontSize: 12.5,
        color: '#6b7a9e',
        textAlign: 'center',
        lineHeight: 1.5,
        maxWidth: Math.round(size * 1.1),
        opacity: labelOpacity,
      }}>
        {subtitle}
      </div>
    )}

    {/* Screen-specific footer slot */}
    {footerContent && (
      <div style={{ marginTop: 16, width: '100%' }}>
        {footerContent}
      </div>
    )}
  </div>
);
