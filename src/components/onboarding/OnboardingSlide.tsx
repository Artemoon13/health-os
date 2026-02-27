import { useState, useEffect } from 'react'
import { C, F } from '../../constants/theme'
import { usePressFeedback } from '../../lib/usePressFeedback'
import { AppPreview } from './AppPreview'
import type { OnboardingSlide as SlideData } from '../../constants/data'

interface OnboardingSlideProps {
  slide: SlideData
  isLast: boolean
  onNext: () => void
}

export function OnboardingSlide({ slide, isLast, onNext }: OnboardingSlideProps) {
  const [visible, setVisible] = useState(false)
  const press = usePressFeedback()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [slide.id])

  const enter = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(16px)',
    transition: `opacity .5s ease ${delay}s, transform .5s ease ${delay}s`,
  })

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 24px 36px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: C.blue, filter: 'blur(100px)', opacity: .06, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 100, left: -60, width: 200, height: 200, borderRadius: '50%', background: C.green, filter: 'blur(80px)', opacity: .05, pointerEvents: 'none' }} />

      {/* Tag */}
      <div style={{ paddingTop: 60, marginBottom: 24, ...enter(0.1) }}>
        <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '.2em', color: C.blue, textTransform: 'uppercase', padding: '5px 12px', background: `${C.blue}15`, borderRadius: 99, border: `1px solid ${C.blue}30` }}>
          {slide.tag}
        </span>
      </div>

      {/* Animated Preview */}
      <div style={{ marginBottom: 28, ...enter(0.2) }}>
        <AppPreview type={slide.preview} />
      </div>

      {/* Title */}
      <div style={{ marginBottom: 14, ...enter(0.3) }}>
        <h1 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.05, whiteSpace: 'pre-line' }}>
          {slide.title}
        </h1>
      </div>

      {/* Subtitle */}
      <div style={{ flex: 1, ...enter(0.4) }}>
        <p style={{ fontSize: 15, color: C.sub, lineHeight: 1.7, fontWeight: 300 }}>{slide.sub}</p>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        onPointerDown={press.onPointerDown}
        onPointerUp={press.onPointerUp}
        onPointerLeave={press.onPointerLeave}
        style={{
          width: '100%', padding: '16px',
          background: isLast ? `linear-gradient(135deg,${C.blue},${C.purple})` : `linear-gradient(135deg,${C.blue},#2563EB)`,
          border: 'none', borderRadius: 16, color: '#fff',
          fontFamily: F.display, fontSize: 17, fontWeight: 700,
          cursor: 'pointer', letterSpacing: '-.01em',
          boxShadow: `0 8px 32px ${C.blue}40`,
          transition: 'transform .1s ease, opacity .1s ease',
          ...press.pressStyle,
          ...enter(0.5),
        }}
      >
        {slide.cta} →
      </button>
    </div>
  )
}
