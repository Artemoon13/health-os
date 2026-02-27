// ─── Color Palette ────────────────────────────────────────────────────────────

export const C = {
  bg:      '#030304',
  surf:    '#0C0C12',
  card:    '#111118',
  cardHi:  '#16161E',
  b:       'rgba(255,255,255,0.06)',
  bHi:     'rgba(255,255,255,0.12)',
  blue:    '#3B82F6',
  green:   '#10B981',
  orange:  '#F59E0B',
  red:     '#EF4444',
  purple:  '#8B5CF6',
  pink:    '#EC4899',
  text:    '#F0F0F5',
  sub:     '#6B7280',
  muted:   '#2D2D38',
} as const

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONT_GOOGLE_URL =
  "https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap"

export const F = {
  display: "'Syne', sans-serif",
  mono:    "'DM Mono', monospace",
  body:    "'DM Sans', sans-serif",
} as const

// ─── Global CSS ───────────────────────────────────────────────────────────────

export const GLOBAL_CSS = `
@import url('${FONT_GOOGLE_URL}');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  background: ${C.bg};
  overscroll-behavior: none;
  height: 100%;
}

#root {
  height: 100%;
}

@keyframes pageIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.85); }
}

.scroll-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scroll-hidden::-webkit-scrollbar {
  display: none;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
`
