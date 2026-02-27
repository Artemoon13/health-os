import { C, F } from '../../constants/theme'
import { usePressFeedback } from '../../lib/usePressFeedback'
import { Icons } from '../ui/Icons'
import type { AppTab } from '../../types'

interface NavBarProps {
  activeTab: AppTab
  onChange:  (tab: AppTab) => void
}

interface TabConfig {
  id:    AppTab
  label: string
  icon:  (color: string) => React.ReactElement
}

const TABS: TabConfig[] = [
  { id: 'dashboard', label: 'Home',  icon: c => <Icons.Home     color={c} size={20} /> },
  { id: 'nutrition', label: 'Food',  icon: c => <Icons.Food     color={c} size={20} /> },
  { id: 'activity',  label: 'Burn',  icon: c => <Icons.Activity color={c} size={20} /> },
  { id: 'recovery',  label: 'Recov', icon: c => <Icons.Heart    color={c} size={20} /> },
  { id: 'stats',     label: 'Stats', icon: c => <Icons.BarChart color={c} size={20} /> },
  { id: 'profile',   label: 'Me',    icon: c => <Icons.User     color={c} size={20} /> },
]

export function NavBar({ activeTab, onChange }: NavBarProps) {
  return (
    <nav style={{
      height: 74, flexShrink: 0,
      background: 'rgba(3,3,4,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${C.b}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 4px', position: 'relative', zIndex: 10,
    }}>
      {TABS.map(t => {
        const active = activeTab === t.id
        return (
          <NavBarButton key={t.id} active={active} onClick={() => onChange(t.id)} icon={t.icon} label={t.label} />
        )
      })}
    </nav>
  )
}

function NavBarButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: (c: string) => JSX.Element; label: string }) {
  const press = usePressFeedback()
  return (
    <button
      onClick={onClick}
      onPointerDown={press.onPointerDown}
      onPointerUp={press.onPointerUp}
      onPointerLeave={press.onPointerLeave}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: '8px 10px', border: 'none', background: 'none',
        cursor: 'pointer', borderRadius: 12, flex: 1,
        transition: 'transform .1s ease, opacity .1s ease',
        ...press.pressStyle,
      }}
    >
      {icon(active ? C.blue : C.muted)}
      <span style={{
        fontFamily: F.mono, fontSize: 9, letterSpacing: '.1em',
        textTransform: 'uppercase', color: active ? C.blue : C.muted,
        transition: 'color .2s',
      }}>
        {label}
      </span>
    </button>
  )
}
