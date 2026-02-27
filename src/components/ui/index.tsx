import { useState, useCallback } from 'react'
import type { RingProps, BadgeProps, FBarProps } from '../../types'
import { C, F } from '../../constants/theme'

// ─── Ring ─────────────────────────────────────────────────────────────────────

export function Ring({ size = 140, strokeWidth = 10, percent, color, glow = true, children }: RingProps) {
  const r    = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const off  = circ - (circ * Math.min(percent, 100)) / 100

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.05)" strokeWidth={strokeWidth} fill="none" />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circ} strokeDashoffset={off}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)',
            filter: glow ? `drop-shadow(0 0 6px ${color}80)` : undefined,
          }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>{children}</div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ text, color, dot }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 9px', borderRadius: 99,
      fontFamily: F.mono, fontSize: 9, letterSpacing: '.1em',
      textTransform: 'uppercase', fontWeight: 500,
      border: `1px solid ${color}40`, background: `${color}14`, color,
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: color,
          display: 'inline-block', animation: 'pulse 2s ease-in-out infinite',
        }} />
      )}
      {text}
    </span>
  )
}

// ─── FBar ─────────────────────────────────────────────────────────────────────

export function FBar({ label, value, color }: FBarProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: C.sub }}>
          {label}
        </span>
        <span style={{ fontFamily: F.mono, fontSize: 10, color }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, background: color, borderRadius: 99,
          boxShadow: `0 0 8px ${color}60`,
          transition: 'width 1s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'icon'
  accentColor?: string
  children: React.ReactNode
}

function usePressFeedback() {
  const [pressed, setPressed] = useState(false)
  const onPointerDown = useCallback(() => {
    setPressed(true)
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8)
  }, [])
  const onPointerUp = useCallback(() => setPressed(false), [])
  const onPointerLeave = useCallback(() => setPressed(false), [])
  const pressStyle: React.CSSProperties = pressed
    ? { transform: 'scale(0.97)', opacity: 0.92 }
    : {}
  return { onPointerDown, onPointerUp, onPointerLeave, pressStyle }
}

export function Button({ variant = 'primary', accentColor, children, style, onPointerDown, onPointerUp, onPointerLeave, ...props }: ButtonProps) {
  const press = usePressFeedback()
  const base: React.CSSProperties = {
    border: 'none', cursor: 'pointer', borderRadius: 14,
    fontFamily: F.display, fontSize: 16, fontWeight: 700,
    transition: 'transform .1s ease, opacity .1s ease',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      width: '100%', padding: '14px',
      background: accentColor ?? C.blue, color: '#fff',
      boxShadow: `0 8px 32px ${(accentColor ?? C.blue)}40`,
      letterSpacing: '-.01em',
    },
    ghost: {
      background: 'rgba(255,255,255,.05)', border: `1px solid ${C.b}`,
      color: C.sub, borderRadius: 12, padding: '12px 18px',
      fontFamily: F.mono, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
      width: '100%',
    },
    danger: {
      width: 28, height: 28, borderRadius: 8,
      background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)',
      color: C.red, padding: 0,
    },
    icon: {
      width: 42, height: 42, borderRadius: '50%',
      background: `${accentColor ?? C.blue}20`, border: `1px solid ${(accentColor ?? C.blue)}40`,
      padding: 0,
    },
  }

  return (
    <button
      style={{ ...base, ...variants[variant], ...press.pressStyle, ...style }}
      onPointerDown={(e) => { press.onPointerDown(); onPointerDown?.(e) }}
      onPointerUp={(e) => { press.onPointerUp(); onPointerUp?.(e) }}
      onPointerLeave={(e) => { press.onPointerLeave(); onPointerLeave?.(e) }}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  accentColor?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export function Card({ children, accentColor, style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card, border: `1px solid ${C.b}`, borderRadius: 20,
        position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
        transition: onClick ? 'all .18s' : undefined,
        ...style,
      }}
    >
      {accentColor && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accentColor, opacity: .7 }} />
      )}
      {children}
    </div>
  )
}

// ─── Section Label ────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: C.sub, marginBottom: 10 }}>
      {children}
    </div>
  )
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ onClose, title, children }: ModalProps) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(8px)', zIndex: 50,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn .2s ease',
      }}
    >
      <div style={{
        background: C.surf, border: `1px solid ${C.bHi}`,
        borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 430,
        padding: '24px 22px 36px',
        animation: 'slideUp .25s cubic-bezier(.4,0,.2,1)',
        maxHeight: '90vh', overflowY: 'auto',
      }} className="scroll-hidden">
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 99, background: C.b, margin: '0 auto 20px' }} />
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.sub, padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontFamily: F.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: C.sub, marginBottom: 7 }}>
        {label}
      </label>
      <input
        style={{
          width: '100%', padding: '13px 16px',
          background: C.card, border: `1px solid ${C.b}`,
          borderRadius: 12, color: C.text,
          fontFamily: F.body, fontSize: 15,
          outline: 'none',
          ...style,
        }}
        {...props}
      />
    </div>
  )
}
