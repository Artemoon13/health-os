import { C, F } from '../../constants/theme'
import { S } from '../../constants/strings'

interface SyncBannerProps {
  /** Sync failed (e.g. Supabase error) */
  syncError: string | null
  /** No network */
  isOffline: boolean
  onRetry: () => void
  onDismiss: () => void
}

export function SyncBanner({ syncError, isOffline, onRetry, onDismiss }: SyncBannerProps) {
  const show = syncError || isOffline
  if (!show) return null

  const message = isOffline ? S.offlineMessage : S.syncErrorMessage

  return (
    <div
      style={{
        padding: '10px 16px',
        background: isOffline ? `${C.orange}18` : 'rgba(239,68,68,.12)',
        borderBottom: `1px solid ${isOffline ? `${C.orange}40` : 'rgba(239,68,68,.25)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{message}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {syncError && (
          <button
            onClick={onRetry}
            style={{
              padding: '6px 12px',
              background: C.blue,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontFamily: F.mono,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {S.retry}
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: `1px solid ${C.b}`,
            borderRadius: 8,
            color: C.sub,
            fontFamily: F.mono,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          {S.dismiss}
        </button>
      </div>
    </div>
  )
}
