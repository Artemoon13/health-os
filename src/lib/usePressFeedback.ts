import { useState, useCallback } from 'react'

/** Visual press feedback + optional haptic. Use on buttons/tappable elements. */
export function usePressFeedback(options?: { haptic?: boolean }) {
  const [pressed, setPressed] = useState(false)
  const haptic = options?.haptic !== false

  const onPointerDown = useCallback(() => {
    setPressed(true)
    if (haptic && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8)
    }
  }, [haptic])

  const onPointerUp = useCallback(() => setPressed(false), [])
  const onPointerLeave = useCallback(() => setPressed(false), [])

  const pressStyle: React.CSSProperties = pressed
    ? { transform: 'scale(0.97)', opacity: 0.92, transition: 'transform .1s ease, opacity .1s ease' }
    : { transition: 'transform .15s ease, opacity .15s ease' }

  return { onPointerDown, onPointerUp, onPointerLeave, pressStyle, pressed }
}
