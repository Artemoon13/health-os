import { C, F } from '../../constants/theme'
import { Modal } from '../ui'
import type { MorningFeeling } from '../../types'

const OPTIONS: { value: MorningFeeling; label: string; emoji: string }[] = [
  { value: 'energized', label: 'Energized', emoji: '⚡' },
  { value: 'normal', label: 'Normal', emoji: '👍' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'exhausted', label: 'Exhausted', emoji: '🛏️' },
]

interface MorningCheckModalProps {
  onClose: () => void
  onSelect: (feeling: MorningFeeling) => void
}

export function MorningCheckModal({ onClose, onSelect }: MorningCheckModalProps) {
  return (
    <Modal onClose={onClose} title="Morning Check">
      <div style={{ fontFamily: F.display, fontSize: 17, color: C.sub, marginBottom: 20 }}>
        How do you feel today?
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {OPTIONS.map(({ value, label, emoji }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            style={{
              width: '100%',
              padding: 16,
              background: C.card,
              border: `1px solid ${C.b}`,
              borderRadius: 14,
              color: C.text,
              fontFamily: F.display,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 24 }}>{emoji}</span>
            {label}
          </button>
        ))}
      </div>
    </Modal>
  )
}
