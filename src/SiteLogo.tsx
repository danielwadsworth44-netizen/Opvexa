type SiteLogoProps = {
  className?: string
  variant?: 'header' | 'footer'
}

export function SiteLogo({ className = '', variant = 'header' }: SiteLogoProps) {
  const size = variant === 'footer' ? 'opvexa-wordmark--footer' : ''
  return (
    <span className={`opvexa-wordmark ${size} ${className}`.trim()}>
      <span className="opvexa-wordmark__mark" aria-hidden />
      <span className="opvexa-wordmark__text">Opvexa</span>
    </span>
  )
}
