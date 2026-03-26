import { useId } from 'react'

type SiteLogoProps = {
  className?: string
  variant?: 'header' | 'footer'
}

function LogoMark({ compact, gradientId }: { compact?: boolean; gradientId: string }) {
  const w = compact ? 22 : 28
  const h = compact ? 28 : 36
  return (
    <svg
      className="opvexa-wordmark__svg"
      width={w}
      height={h}
      viewBox="0 0 28 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Phone body — midnight navy */}
      <rect x="4" y="1" width="20" height="34" rx="5" fill="#0a1628" stroke="#38bdf8" strokeWidth="1.25" />
      {/* Screen — slightly lighter navy */}
      <rect x="6.5" y="5" width="15" height="22" rx="2" fill="#0d1a32" stroke="rgba(148,163,184,0.35)" strokeWidth="0.75" />
      {/* Earpiece — cool gray */}
      <rect x="11" y="3" width="6" height="1.25" rx="0.5" fill="#64748b" />
      {/* Check — electric blue */}
      <path
        d="M9.5 19.5l3.2 3.5 6.3-8.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id={gradientId} x1="9.5" y1="15" x2="19" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0077ed" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* Home indicator — cool gray */}
      <rect x="11" y="30" width="6" height="1.25" rx="0.5" fill="#64748b" opacity="0.85" />
    </svg>
  )
}

export function SiteLogo({ className = '', variant = 'header' }: SiteLogoProps) {
  const size = variant === 'footer' ? 'opvexa-wordmark--footer' : ''
  const gradientId = `opvexa-check-${useId().replace(/:/g, '')}`
  return (
    <span className={`opvexa-wordmark ${size} ${className}`.trim()}>
      <span className="opvexa-wordmark__mark">
        <LogoMark compact={variant === 'footer'} gradientId={gradientId} />
      </span>
      <span className="opvexa-wordmark__text">Opvexa</span>
    </span>
  )
}
