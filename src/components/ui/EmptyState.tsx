import { C, F } from '../../constants/theme'

interface EmptyStateProps {
  emoji: string
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.sub }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, marginBottom: 16 }}>{subtitle}</div>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: 8,
            padding: '10px 24px',
            background: 'rgba(255,255,255,.05)',
            border: `1px solid ${C.b}`,
            borderRadius: 12,
            color: C.sub,
            fontFamily: F.mono,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
