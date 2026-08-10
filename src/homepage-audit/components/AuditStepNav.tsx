import type { FC } from 'react';

export type StepState = 'done' | 'active' | 'pending';

export interface AuditStepItem {
  /** 1-based step number */
  number: number;
  label: string;
  state: StepState;
}

/** Default 10-step audit progression — override `state` per scene */
export const DEFAULT_AUDIT_STEPS: AuditStepItem[] = [
  { number: 1,  label: 'Intro',         state: 'done'    },
  { number: 2,  label: 'Overall Score', state: 'done'    },
  { number: 3,  label: 'On-Page SEO',   state: 'active'  },
  { number: 4,  label: 'Technical',     state: 'pending' },
  { number: 5,  label: 'Security',      state: 'pending' },
  { number: 6,  label: 'AI Visibility', state: 'pending' },
  { number: 7,  label: 'Performance',   state: 'pending' },
  { number: 8,  label: 'Accessibility', state: 'pending' },
  { number: 9,  label: 'Social',        state: 'pending' },
  { number: 10, label: 'Local SEO',     state: 'pending' },
];

// ── Per-state color tokens (activeColor is theme-driven per screen) ───────────
const getStateStyle = (activeColor: string) => ({
  done: {
    border: '#22c55e',
    color: '#22c55e',
    background: '#0a1f10',
    boxShadow: 'none',
    labelColor: '#6b7a9e',
  },
  active: {
    border: activeColor,
    color: activeColor,
    background: `${activeColor}18`,
    boxShadow: `0 0 12px ${activeColor}66`,
    labelColor: activeColor,
  },
  pending: {
    border: '#232d4a',
    color: '#6b7a9e',
    background: 'transparent',
    boxShadow: 'none',
    labelColor: '#6b7a9e',
  },
});

interface AuditStepNavProps {
  brandName?: string;
  brandSuffix?: string;
  pageLabel?: string;
  steps?: AuditStepItem[];
  translateY?: number;
  /** Active step ring/label color — default blue, pass red for Security, etc. */
  activeColor?: string;
}

export const AuditStepNav: FC<AuditStepNavProps> = ({
  brandName   = 'odito',
  brandSuffix = 'ai',
  pageLabel   = 'Website Audit',
  steps       = DEFAULT_AUDIT_STEPS,
  translateY  = 0,
  activeColor = '#4f9cf9',
}) => {
  const stateStyle = getStateStyle(activeColor);
  return (
    <div style={{
      background: '#090c18',
      borderBottom: '1px solid #1a2240',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      transform: `translateY(${translateY}px)`,
    }}>
      {/* Logo */}
      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', flexShrink: 0 }}>
        {brandName}
        <span style={{ color: '#4f9cf9' }}>.{brandSuffix}</span>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 22, background: '#232d4a', margin: '0 18px', flexShrink: 0 }} />

      {/* Page label */}
      <div style={{ fontSize: 13, color: '#6b7a9e', fontWeight: 500, flexShrink: 0 }}>{pageLabel}</div>

      {/* Step indicators */}
      <nav style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
        {steps.map((step, i) => {
          const st = stateStyle[step.state];
          // Step 1 done → ✓  |  all others → their number
          const content = step.state === 'done' && step.number === 1 ? '✓' : String(step.number);
          return (
            <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Step column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  border: `2px solid ${st.border}`,
                  color: st.color,
                  background: st.background,
                  boxShadow: st.boxShadow,
                }}>
                  {content}
                </div>
                <div style={{ fontSize: 9.5, color: st.labelColor, whiteSpace: 'nowrap' }}>
                  {step.label}
                </div>
              </div>
              {/* Connector line between steps */}
              {i < steps.length - 1 && (
                <div style={{ width: 22, height: 2, background: '#1a2240', marginBottom: 14, flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};
