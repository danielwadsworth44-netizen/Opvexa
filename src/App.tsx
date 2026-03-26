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
    title: 'Speed still wins on leads',
    detail:
      'Firms that respond to web leads within an hour are far more likely to have a meaningful conversation than those that wait.',
    sourceLabel: 'Harvard Business Review',
    sourceUrl: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads',
  },
  {
    value: '24/7',
    title: 'Expectations never sleep',
    detail:
      'Customers increasingly expect answers outside business hours—automation and AI fill the gap without burning out your team.',
    sourceLabel: 'Zendesk',
    sourceUrl: 'https://www.zendesk.com/blog/customers-want-fast-responses/',
  },
  {
    value: '~60%',
    title: 'Time on repetitive work',
    detail:
      'Knowledge workers report spending most of their week on manual coordination—prime territory for smart systems and workflows.',
    sourceLabel: 'Asana',
    sourceUrl: 'https://asana.com/resources/anatomy-of-work',
  },
]

const quickReplies = ['More leads', 'Better customer service', 'Save time', 'Just exploring']

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
    return 'Lead capture is a strong fit—think instant replies, after-hours coverage, and cleaner routing to your team.'
  }

  if (normalized.includes('service') || normalized.includes('support') || normalized.includes('customer')) {
    return 'We can prioritize faster answers, FAQs, and handoffs so customers feel taken care of without extra headcount.'
  }

  if (normalized.includes('time') || normalized.includes('busy') || normalized.includes('manual')) {
    return 'Automation shines when it removes repeat questions, scheduling ping-pong, and follow-up gaps.'
  }

  return 'Thanks for sharing. We will use that to suggest the right mix of AI touchpoints and automation for your business.'
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
          text: 'Do you already use a CRM, booking tool, or inbox where leads land today?',
        },
      ]
    case 'tools':
      return usesTools(input)
        ? [
            {
              role: 'assistant',
              text: 'Great. Where does it hurt most—slow first response, after-hours gaps, or follow-ups falling through the cracks?',
            },
          ]
        : [
            {
              role: 'assistant',
              text: 'No problem. We can start simple with capture and routing, then layer automation as you grow.',
            },
            {
              role: 'assistant',
              text: 'What would you want handled first: missed calls and texts, website inquiries, or repeat customer questions?',
            },
          ]
    case 'pain':
      return [
        {
          role: 'assistant',
          text: 'That helps. Opvexa systems are built around those exact friction points for local operators.',
        },
        {
          role: 'assistant',
          text: 'Want to walk through a quick fit call? Pick a time that works on the calendar link when you are ready.',
        },
      ]
    case 'wrap-up':
      return [
        {
          role: 'assistant',
          text: 'Happy to keep going here—or book a call and we will map a practical first version for your business.',
        },
      ]
  }
}

function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [userGoal, setUserGoal] = useState('')
  const [message, setMessage] = useState('')
  const [chatStage, setChatStage] = useState<ChatStage>('goal')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hi — I'm the Opvexa assistant. What should improve first: leads, customer replies, or time saved?",
    },
  ])
  const chatMessagesRef = useRef<HTMLDivElement | null>(null)

  const hasStartedChat = messages.some((entry) => entry.role === 'user')

  const chatSummary = useMemo(() => {
    if (!userGoal.trim()) {
      return hasStartedChat
        ? 'Tell us your priority and we will tailor next steps.'
        : 'Tap an option or type a message below.'
    }

    return `Your focus: ${userGoal}`
  }, [userGoal, hasStartedChat])

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

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToSolutions = () => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })
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
          <button className="brand" type="button" onClick={scrollTop} aria-label="Opvexa home">
            <span className="brand-mark brand-mark--opvexa">
              <SiteLogo />
            </span>
          </button>

          <nav className="site-nav" aria-label="Primary">
            <button className="active" type="button" onClick={scrollTop}>
              Home
            </button>
            <button type="button" onClick={scrollToSolutions}>
              Solutions
            </button>
            <a href={bookingUrl} target="_blank" rel="noreferrer">
              Book a call
            </a>
          </nav>
        </header>

        <main>
          <section className="hero-section">
            <Reveal className="hero-copy" direction="left">
              <p className="eyebrow">AI-powered growth systems for local businesses</p>
              <h1>Never Miss Leads Again</h1>
              <p className="hero-text">
                Opvexa helps local businesses capture more leads, improve customer service, and save time with
                AI-powered systems and automation.
              </p>

              <div className="hero-actions">
                <a className="button button-primary" href={bookingUrl} target="_blank" rel="noreferrer">
                  Book a call
                </a>
                <button className="button button-secondary" type="button" onClick={scrollToSolutions}>
                  See what we automate
                </button>
              </div>
            </Reveal>

            <Reveal className="hero-panel" direction="right" delay={120}>
              <div className="hero-card hero-card-primary">
                <p className="card-label">What Opvexa builds</p>
                <h2>Systems that answer, capture, and follow up.</h2>
                <p>
                  Practical AI and workflows around your real tools—so inquiries get handled fast, customers feel
                  looked after, and your team spends time on work that actually moves the business.
                </p>
              </div>

              <div className="hero-card hero-card-glow">
                <p className="card-label">What we fix first</p>
                <div className="mini-stack">
                  <span>Missed or slow lead response</span>
                  <span>Repeat questions &amp; scheduling churn</span>
                  <span>After-hours and peak-time gaps</span>
                </div>
              </div>
            </Reveal>
          </section>

          <section className="section section-tight">
            <Reveal className="section-heading">
              <p className="eyebrow">Why speed and systems matter</p>
              <h2>Local winners respond fast—and automate the busywork.</h2>
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

          <section className="section" id="solutions">
            <Reveal className="section-heading">
              <p className="eyebrow">Built for operators</p>
              <h2>Clear outcomes—not buzzwords.</h2>
            </Reveal>

            <div className="value-grid">
              <Reveal direction="left" delay={0}>
                <article className="value-card">
                  <h3>Capture more leads</h3>
                  <p>
                    Smarter intake on your site, messages, and missed calls so opportunities do not vanish into the
                    void.
                  </p>
                </article>
              </Reveal>
              <Reveal direction="up" delay={120}>
                <article className="value-card">
                  <h3>Better customer service</h3>
                  <p>
                    Instant answers, guided next steps, and clean handoffs to your people when a human touch matters.
                  </p>
                </article>
              </Reveal>
              <Reveal direction="right" delay={240}>
                <article className="value-card">
                  <h3>Save real time</h3>
                  <p>
                    Automate follow-ups, reminders, and repeat workflows so your week is not lost to admin noise.
                  </p>
                </article>
              </Reveal>
            </div>
          </section>

          <section className="section booking-section">
            <Reveal className="booking-copy" direction="left">
              <p className="eyebrow">Start with a fit call</p>
              <h2>Tell us how leads and customers move through your business today.</h2>
              <p>We will map where AI and automation earn the quickest wins—without overbuilding on day one.</p>
              <div className="booking-actions">
                <a className="button button-primary" href={bookingUrl} target="_blank" rel="noreferrer">
                  Book a call
                </a>
              </div>
            </Reveal>

            <Reveal direction="right" delay={120}>
              <div className="booking-panel">
                <p className="card-label">On the call</p>
                <ul className="checklist">
                  <li>Quick read on channels where leads and questions show up.</li>
                  <li>A practical starter system tailored to your volume and tools.</li>
                  <li>Clear next steps if you want Opvexa to implement and iterate.</li>
                </ul>
              </div>
            </Reveal>
          </section>
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
                  Book a call when you are ready
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
