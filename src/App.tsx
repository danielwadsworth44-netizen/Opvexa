import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react'
import './App.css'
import { SiteLogo } from './SiteLogo'

const bookingUrl =
  import.meta.env.VITE_OPVEXA_BOOKING_URL || 'https://calendar.google.com/'

const proofStats = [
  {
    value: '< 5 min',
    title: 'Fast response wins',
    detail: 'Quick replies to web leads correlate with actually connecting—waiting costs you the conversation.',
    sourceLabel: 'Harvard Business Review',
    sourceUrl: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads',
  },
  {
    value: '24/7',
    title: 'Always-on expectations',
    detail: 'People expect answers nights and weekends—automation covers the gaps.',
    sourceLabel: 'Zendesk',
    sourceUrl: 'https://www.zendesk.com/blog/customers-want-fast-responses/',
  },
  {
    value: '~60%',
    title: 'Time on busywork',
    detail: 'Most of the week goes to manual coordination—systems eat that overhead.',
    sourceLabel: 'Asana',
    sourceUrl: 'https://asana.com/resources/anatomy-of-work',
  },
]

const clientReviews = [
  {
    quote: 'After-hours leads get an instant reply now—we only step in when it is real work.',
    name: 'Jordan M.',
    role: 'Home services',
  },
  {
    quote: 'Sizing and booking questions get answered without us living in the inbox.',
    name: 'Sam K.',
    role: 'Retail',
  },
  {
    quote: 'Follow-ups do not slip when we are on-site anymore.',
    name: 'Riley T.',
    role: 'Contractor',
  },
]

const productExamples = [
  {
    title: 'Lead capture',
    body: 'Forms, DMs, and missed calls in one flow—auto-reply, qualify, then hand off to you.',
  },
  {
    title: 'Service answers',
    body: 'FAQs and scheduling rules handled fast; escalate to a human when needed.',
  },
  {
    title: 'Workflows',
    body: 'Reminders, pings, and CRM updates from real events—less copy-paste.',
  },
]

const painPoints = [
  {
    title: 'Slow lead response',
    blurb: 'We tighten first touch before leads go cold.',
  },
  {
    title: 'FAQ & scheduling churn',
    blurb: 'We automate the repeat questions.',
  },
  {
    title: 'Off-hours gaps',
    blurb: 'Capture and answers stay on 24/7.',
  },
]

const quickReplies = ['More leads', 'Better customer service', 'Save time', 'Just exploring']

type Page = 'home' | 'solutions'

type RevealDirection = 'up' | 'left' | 'right'
type ChatRole = 'assistant' | 'user'
type ChatStage = 'goal' | 'tools' | 'pain' | 'wrap-up'

type ChatMessage = {
  role: ChatRole
  text: string
}

function Reveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  direction?: RevealDirection
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current

    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
  }

  return (
    <div
      ref={ref}
      style={style}
      className={`reveal reveal-${direction} ${visible ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  )
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3c-4.97 0-9 3.58-9 8 0 2.24 1.04 4.27 2.72 5.72L5 21l4.45-2.22c.81.15 1.66.22 2.55.22 4.97 0 9-3.58 9-8s-4.03-8-9-8Z"
        fill="currentColor"
      />
      <circle cx="8.5" cy="11" r="1.1" fill="#fff" />
      <circle cx="12" cy="11" r="1.1" fill="#fff" />
      <circle cx="15.5" cy="11" r="1.1" fill="#fff" />
    </svg>
  )
}

const buildAssistantReply = (input: string) => {
  const normalized = input.toLowerCase()

  if (normalized.includes('lead') || normalized.includes('miss') || normalized.includes('call')) {
    return 'Strong fit: instant replies, after-hours coverage, cleaner routing.'
  }

  if (normalized.includes('service') || normalized.includes('support') || normalized.includes('customer')) {
    return 'We can speed up FAQs and handoffs without adding headcount.'
  }

  if (normalized.includes('time') || normalized.includes('busy') || normalized.includes('manual')) {
    return 'Automation cuts repeat questions, scheduling ping-pong, and missed follow-ups.'
  }

  return 'Got it—we will match AI and automation to what you described.'
}

const usesTools = (input: string) => {
  const normalized = input.toLowerCase()

  return (
    normalized.includes('yes') ||
    normalized.includes('crm') ||
    normalized.includes('already') ||
    normalized.includes('use') ||
    normalized.includes('have')
  )
}

const getDiscoveryResponses = (stage: ChatStage, input: string): ChatMessage[] => {
  switch (stage) {
    case 'goal':
      return [
        {
          role: 'assistant',
          text: buildAssistantReply(input),
        },
        {
          role: 'assistant',
          text: 'Using a CRM, booking tool, or inbox for leads today?',
        },
      ]
    case 'tools':
      return usesTools(input)
        ? [
            {
              role: 'assistant',
              text: 'Biggest pain: slow first reply, after-hours, or dropped follow-ups?',
            },
          ]
        : [
            {
              role: 'assistant',
              text: 'We can start with capture and routing, then add automation.',
            },
            {
              role: 'assistant',
              text: 'What first: missed calls/texts, web leads, or repeat customer questions?',
            },
          ]
    case 'pain':
      return [
        {
          role: 'assistant',
          text: 'That maps to what we build for local teams.',
        },
        {
          role: 'assistant',
          text: 'Book a call on the calendar when you want to go deeper.',
        },
      ]
    case 'wrap-up':
      return [
        {
          role: 'assistant',
          text: 'Keep chatting here—or book a call for a concrete first plan.',
        },
      ]
  }
}

const getPageFromHash = (): Page =>
  window.location.hash === '#solutions' ? 'solutions' : 'home'

function App() {
  const [page, setPage] = useState<Page>(getPageFromHash)
  const [chatOpen, setChatOpen] = useState(false)
  const [userGoal, setUserGoal] = useState('')
  const [message, setMessage] = useState('')
  const [chatStage, setChatStage] = useState<ChatStage>('goal')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi—what matters most: leads, service, or saving time?',
    },
  ])
  const chatMessagesRef = useRef<HTMLDivElement | null>(null)

  const hasStartedChat = messages.some((entry) => entry.role === 'user')

  const chatSummary = useMemo(() => {
    if (!userGoal.trim()) {
      return hasStartedChat ? 'Your priority shapes what we suggest next.' : 'Tap a chip or type below.'
    }

    return `Your focus: ${userGoal}`
  }, [userGoal, hasStartedChat])

  useEffect(() => {
    const sync = () => {
      setPage(getPageFromHash())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    if (!chatOpen) {
      return
    }

    const container = chatMessagesRef.current

    if (!container) {
      return
    }

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight
    })
  }, [messages, chatOpen])

  const navigateTo = (next: Page) => {
    window.location.hash = next === 'solutions' ? 'solutions' : ''
  }

  const handleQuickReply = (reply: string) => {
    const nextStage =
      chatStage === 'goal' ? 'tools' : chatStage === 'tools' ? 'pain' : 'wrap-up'

    setUserGoal(reply)
    setMessages((current) => [
      ...current,
      { role: 'user', text: reply },
      ...getDiscoveryResponses(chatStage, reply),
    ])
    setChatStage(nextStage)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      return
    }

    const nextStage =
      chatStage === 'goal' ? 'tools' : chatStage === 'tools' ? 'pain' : 'wrap-up'

    setUserGoal(trimmedMessage)
    setMessages((current) => [
      ...current,
      { role: 'user', text: trimmedMessage },
      ...getDiscoveryResponses(chatStage, trimmedMessage),
    ])
    setChatStage(nextStage)
    setMessage('')
  }

  return (
    <>
      <div className="page-shell">
        <header className="site-header">
          <button className="brand" type="button" onClick={() => navigateTo('home')} aria-label="Opvexa home">
            <span className="brand-mark brand-mark--opvexa">
              <SiteLogo />
            </span>
          </button>

          <nav className="site-nav" aria-label="Primary">
            <button className={page === 'home' ? 'active' : ''} type="button" onClick={() => navigateTo('home')}>
              Home
            </button>
            <button
              className={page === 'solutions' ? 'active' : ''}
              type="button"
              onClick={() => navigateTo('solutions')}
            >
              Solutions
            </button>
            <a href={bookingUrl} target="_blank" rel="noreferrer">
              Book a call
            </a>
          </nav>
        </header>

        <main key={page}>
          {page === 'home' ? (
            <>
              <section className="hero-section">
                <Reveal className="hero-eyebrow" direction="left">
                  <p className="eyebrow">AI systems for local business</p>
                </Reveal>
                <Reveal className="hero-main-block" direction="left" delay={50}>
                  <div className="hero-main">
                    <h1>Never Miss Leads Again</h1>
                    <p className="hero-text">More leads, faster replies, less busywork—AI and automation built around how you work.</p>

                    <div className="hero-actions">
                      <a className="button button-primary" href={bookingUrl} target="_blank" rel="noreferrer">
                        Book a call
                      </a>
                      <button className="button button-secondary" type="button" onClick={() => navigateTo('solutions')}>
                        See solutions
                      </button>
                    </div>
                  </div>
                </Reveal>

                <Reveal className="hero-panel" direction="right" delay={120}>
                  <div className="hero-card hero-card-primary">
                    <p className="card-label">What we build</p>
                    <h2>Answer, capture, follow up.</h2>
                    <p>AI and workflows on your tools—fast replies, clean handoffs, less admin.</p>
                  </div>
                </Reveal>
              </section>

              <section className="section section-tight home-pain-section" aria-labelledby="pain-heading">
                <Reveal className="section-heading">
                  <p className="eyebrow">What we fix first</p>
                  <h2 id="pain-heading">Common bottlenecks</h2>
                </Reveal>
                <div className="pain-grid">
                  {painPoints.map((item, index) => {
                    const direction: RevealDirection =
                      index === 0 ? 'left' : index === 1 ? 'up' : 'right'
                    return (
                      <Reveal key={item.title} direction={direction} delay={80 + index * 90}>
                        <article className="pain-point-card">
                          <h3>{item.title}</h3>
                          <p>{item.blurb}</p>
                        </article>
                      </Reveal>
                    )
                  })}
                </div>
              </section>

              <section className="section section-tight">
                <Reveal className="section-heading">
                  <p className="eyebrow">Why it matters</p>
                  <h2>Speed and systems beat guesswork.</h2>
                </Reveal>

                <div className="stats-grid">
                  {proofStats.map((stat, index) => {
                    const direction: RevealDirection =
                      index === 0 ? 'left' : index === 1 ? 'up' : 'right'
                    const delay = index === 1 ? 0 : index === 0 ? 170 : 300

                    return (
                      <Reveal key={`home-${stat.title}`} direction={direction} delay={delay}>
                        <article className="stat-card">
                          <p className="stat-value">{stat.value}</p>
                          <h3>{stat.title}</h3>
                          <p>{stat.detail}</p>
                          <a href={stat.sourceUrl} target="_blank" rel="noreferrer">
                            Source: {stat.sourceLabel}
                          </a>
                        </article>
                      </Reveal>
                    )
                  })}
                </div>
              </section>

              <section className="section booking-section">
                <Reveal className="booking-copy" direction="left">
                  <p className="eyebrow">Next step</p>
                  <h2>Book a short fit call.</h2>
                  <p>We map the fastest wins—no bloated scope on day one.</p>
                  <div className="booking-actions">
                    <a className="button button-primary" href={bookingUrl} target="_blank" rel="noreferrer">
                      Book a call
                    </a>
                    <button className="button button-secondary" type="button" onClick={() => navigateTo('solutions')}>
                      Reviews &amp; examples
                    </button>
                  </div>
                </Reveal>

                <Reveal direction="right" delay={120}>
                  <div className="booking-panel">
                    <p className="card-label">On the call</p>
                    <ul className="checklist">
                      <li>Where leads and questions actually land.</li>
                      <li>A starter system sized to your volume.</li>
                      <li>Clear next steps if we build it.</li>
                    </ul>
                  </div>
                </Reveal>
              </section>
            </>
          ) : (
            <div className="solutions-page">
              <Reveal className="page-intro">
                <p className="eyebrow">Solutions</p>
                <h1>Proof, product, and impact.</h1>
                <p className="hero-text">
                  See what operators say, how Opvexa shows up in the wild, and the research behind why speed and
                  automation matter for local businesses.
                </p>
              </Reveal>

              <section className="solutions-block" aria-labelledby="reviews-heading">
                <Reveal className="section-heading">
                  <p className="eyebrow">Reviews</p>
                  <h2 id="reviews-heading">Operator notes</h2>
                  <p className="hero-text">Placeholder quotes—swap for real clients anytime.</p>
                </Reveal>
                <div className="reviews-grid">
                  {clientReviews.map((review, index) => {
                    const direction: RevealDirection =
                      index === 0 ? 'left' : index === 1 ? 'up' : 'right'
                    return (
                      <Reveal key={review.name} direction={direction} delay={index * 100}>
                        <blockquote className="review-card">
                          <p className="review-quote">&ldquo;{review.quote}&rdquo;</p>
                          <footer className="review-meta">
                            {review.name} · {review.role}
                          </footer>
                        </blockquote>
                      </Reveal>
                    )
                  })}
                </div>
              </section>

              <section className="solutions-block" aria-labelledby="products-heading">
                <Reveal className="section-heading">
                  <p className="eyebrow">Examples</p>
                  <h2 id="products-heading">What we deploy</h2>
                </Reveal>
                <div className="products-showcase">
                  {productExamples.map((item, index) => {
                    const direction: RevealDirection =
                      index === 0 ? 'left' : index === 1 ? 'up' : 'right'
                    return (
                      <Reveal key={item.title} direction={direction} delay={index * 110}>
                        <article className="value-card product-example-card">
                          <h3>{item.title}</h3>
                          <p>{item.body}</p>
                        </article>
                      </Reveal>
                    )
                  })}
                </div>
              </section>

              <section className="solutions-block section-tight" aria-labelledby="impact-heading">
                <Reveal className="section-heading">
                  <p className="eyebrow">Impact</p>
                  <h2 id="impact-heading">Research snapshot</h2>
                  <p className="hero-text">Sources, not hype.</p>
                </Reveal>

                <div className="stats-grid">
                  {proofStats.map((stat, index) => {
                    const direction: RevealDirection =
                      index === 0 ? 'left' : index === 1 ? 'up' : 'right'
                    const delay = index === 1 ? 0 : index === 0 ? 170 : 300

                    return (
                      <Reveal key={stat.title} direction={direction} delay={delay}>
                        <article className="stat-card">
                          <p className="stat-value">{stat.value}</p>
                          <h3>{stat.title}</h3>
                          <p>{stat.detail}</p>
                          <a href={stat.sourceUrl} target="_blank" rel="noreferrer">
                            Source: {stat.sourceLabel}
                          </a>
                        </article>
                      </Reveal>
                    )
                  })}
                </div>
              </section>
            </div>
          )}
        </main>

        <footer className="site-footer">
          <div className="footer-brand" aria-label="Opvexa footer">
            <span className="footer-logo">
              <SiteLogo variant="footer" />
            </span>
          </div>
          <a className="footer-email" href="mailto:hello@opvexa.com">
            hello@opvexa.com
          </a>
        </footer>

        <aside className="chat-widget" aria-label="Chat assistant">
          <button
            type="button"
            className="chat-toggle"
            onClick={() => setChatOpen((open) => !open)}
            aria-label={chatOpen ? 'Close chat' : 'Open chat'}
          >
            <ChatIcon />
          </button>

          {chatOpen ? (
            <div className={`chat-panel ${hasStartedChat ? 'chat-panel--thread' : 'chat-panel--intro'}`}>
              <div className="chat-header">
                <div>
                  <strong>Opvexa assistant</strong>
                  <p>{chatSummary}</p>
                </div>
              </div>

              <div ref={chatMessagesRef} className="chat-messages">
                {messages.map((entry, index) => (
                  <div
                    key={`${entry.text}-${index}`}
                    className={`chat-bubble chat-bubble-${entry.role}`}
                  >
                    {entry.text}
                  </div>
                ))}
              </div>

              {!hasStartedChat ? (
                <div className="quick-replies" aria-label="Suggested replies">
                  {quickReplies.map((reply) => (
                    <button key={reply} type="button" onClick={() => handleQuickReply(reply)}>
                      {reply}
                    </button>
                  ))}
                </div>
              ) : null}

              <form className="chat-form" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="chat-message">
                  Your message
                </label>
                <input
                  id="chat-message"
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit">Send</button>
              </form>

              {chatStage === 'wrap-up' ? (
                <a className="chat-booking-link" href={bookingUrl} target="_blank" rel="noreferrer">
                  Book a call
                </a>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </>
  )
}

export default App
