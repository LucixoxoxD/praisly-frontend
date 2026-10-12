import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import QRCodeStyling from "qr-code-styling";
import "./reimagined.css";

const ROOT = "/preview";
const samples = [
  {
    name: "Ananya S.",
    initials: "AS",
    service: "Coffee & conversation",
    text: "The kind of place that turns a quick coffee into your favourite part of the day. Loved the filter coffee!",
    rating: 5,
    time: "12 min ago",
    tone: "peach",
  },
  {
    name: "Rohan M.",
    initials: "RM",
    service: "Weekend brunch",
    text: "Thoughtful service, a lovely little space, and a breakfast I’m already planning to come back for.",
    rating: 5,
    time: "48 min ago",
    tone: "sage",
  },
  {
    name: "Meera K.",
    initials: "MK",
    service: "An afternoon visit",
    text: "Really enjoyed the coffee. A little more seating would make this spot even better.",
    rating: 4,
    time: "2 hours ago",
    tone: "lilac",
  },
];
const faq = [
  [
    "What does Praisly actually do?",
    "Praisly gives your business a QR review flow, optional AI-assisted review drafts, private customer feedback, and a dashboard to follow reviews and local competitors. Your customer stays in control of what they write and post.",
  ],
  [
    "Does it post reviews for my customers?",
    "No. A customer can edit an optional draft, then choose to open Google and post from their own account. Praisly never posts on their behalf.",
  ],
  [
    "Can I use it at more than one location?",
    "Yes. Your main plan includes one location. Extra locations use separately paid add-on subscriptions, with their own QR codes and feedback. You can switch between locations in the dashboard.",
  ],
  [
    "What happens after the free trial?",
    "The trial lasts seven days. Choose a monthly or yearly subscription to keep collecting reviews. If access expires, your existing data remains available and you can manage your billing.",
  ],
  [
    "Can I cancel my subscription?",
    "Yes. Cancel renewal from Billing and keep access for the time you have already paid for. Cancelling the main plan also stops extra-location renewals.",
  ],
];

function Icon({ name = "arrow", size = 20, ...props }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    diagonal: (
      <>
        <path d="M6 18 18 6M6 6h12v12" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    review: (
      <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z" />
    ),
    chart: (
      <>
        <path d="M4 3v17h17M8 15l4-5 4 2 5-7" />
      </>
    ),
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    star: (
      <path d="m12 2 3 6.3 7 .9-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.1 2 9.2l7-.9Z" />
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 8V5l14-3v3M21 11h-6v5h6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4L22 2ZM11 13 22 2" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
function Brand({ dark = false }) {
  return (
    <Link
      to={ROOT}
      className={`p-brand ${dark ? "p-brand-light" : ""}`}
      aria-label="Praisly preview home"
    >
      <span className="p-brand-symbol">
        p<span>✳</span>
      </span>
      praisly<span className="p-brand-period">.</span>
    </Link>
  );
}
function Stars({ rating = 5 }) {
  return (
    <span className="p-stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span>{"★".repeat(5 - rating)}</span>
    </span>
  );
}
function Eyebrow({ children, light = false }) {
  return (
    <div className={`p-eyebrow ${light ? "p-eyebrow-light" : ""}`}>
      <span />
      {children}
    </div>
  );
}
function Button({ children, to, secondary = false, className = "", ...rest }) {
  const cls = `p-button ${secondary ? "p-button-secondary" : ""} ${className}`;
  return to ? (
    <Link className={cls} to={to} {...rest}>
      {children}
      <Icon />
    </Link>
  ) : (
    <button className={cls} {...rest}>
      {children}
      <Icon />
    </button>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="p-header">
      <div className="p-header-inner">
        <Brand />
        <nav
          className={open ? "p-nav p-nav-open" : "p-nav"}
          aria-label="Main navigation"
        >
          <a href="#experience" onClick={() => setOpen(false)}>
            The experience
          </a>
          <a href="#toolkit" onClick={() => setOpen(false)}>
            Your toolkit
          </a>
          <a href="#pricing" onClick={() => setOpen(false)}>
            Pricing
          </a>
          <Link className="p-nav-mobile-demo" to={`${ROOT}/studio`}>
            Explore the demo <Icon />
          </Link>
        </nav>
        <Link className="p-nav-demo" to={`${ROOT}/studio`}>
          Explore the demo <Icon />
        </Link>
        <button
          className="p-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  );
}

function ReputationSculpture() {
  return (
    <div
      className="p-sculpture"
      aria-label="Illustration of customer feedback becoming a business reputation"
    >
      <div className="p-orbit p-orbit-one" />
      <div className="p-orbit p-orbit-two" />
      <div className="p-orbit p-orbit-three" />
      <div className="p-sculpture-label">
        <span className="p-live-dot" /> GOOD WORD TRAVELS.
      </div>
      <div className="p-medallion">
        <div className="p-medallion-rim">
          <span className="p-medallion-top">EVERY EXPERIENCE MATTERS</span>
          <span className="p-medallion-star">✳</span>
          <span className="p-medallion-bottom">MAKE YOURS HEARD</span>
        </div>
      </div>
      <div className="p-float-review p-float-one">
        <div className="p-float-head">
          <span className="p-avatar p-peach">AS</span>
          <div>
            <strong>A little love, shared.</strong>
            <small>A customer’s own words</small>
          </div>
          <span className="p-google">G</span>
        </div>
        <Stars />
        <p>“Our new favourite spot in the neighbourhood.”</p>
        <div className="p-review-foot">
          <span>Every story starts somewhere.</span>
          <Icon name="diagonal" size={16} />
        </div>
      </div>
      <div className="p-float-review p-float-two">
        <span className="p-mini-icon">
          <Icon name="review" />
        </span>
        <div>
          <strong>One great experience.</strong>
          <small>A reputation in the making.</small>
        </div>
        <span className="p-small-star">✦</span>
      </div>
      <span className="p-sculpture-note">
        ILLUSTRATIVE CUSTOMER STORY · NOT A TESTIMONIAL
      </span>
      <span className="p-spark p-spark-one">✳</span>
      <span className="p-spark p-spark-two">+</span>
    </div>
  );
}

function MiniPhone({ step }) {
  return (
    <div className="p-phone">
      <div className="p-phone-status">
        <span>9:41</span>
        <span>••• ▰</span>
      </div>
      <div className="p-phone-island" />
      <div className="p-phone-content" key={step}>
        <span className="p-cafe-mark">b.</span>
        <span className="p-micro">BLOOM COFFEE · DEMO</span>
        {step === 0 ? (
          <>
            <h3>
              A good visit?
              <br />
              Tell us about it.
            </h3>
            <p>A few words from you can mean a lot to a local business.</p>
            <div className="p-phone-stars">★ ★ ★ ★ ★</div>
            <div className="p-phone-pill">
              That made our day. <span>↗</span>
            </div>
          </>
        ) : step === 1 ? (
          <>
            <h3>
              Your experience.
              <br />
              Your words.
            </h3>
            <div className="p-phone-draft">
              “Loved the coffee and the warm welcome. A lovely little
              neighbourhood find.”<span>✧ Optional draft · yours to edit</span>
            </div>
            <div className="p-phone-pill">
              Make it your own <span>↗</span>
            </div>
          </>
        ) : (
          <>
            <div className="p-phone-done">
              <Icon name="check" size={30} />
            </div>
            <h3>
              A little love.
              <br />A lasting impact.
            </h3>
            <p>Choose to share your review on Google, from your own account.</p>
            <div className="p-phone-pill">
              Open Google <span>↗</span>
            </div>
          </>
        )}
        <span className="p-phone-powered">
          thoughtfully powered by <b>praisly.</b>
        </span>
      </div>
      <div className="p-phone-home" />
    </div>
  );
}

function Experience() {
  const [step, setStep] = useState(0);
  const steps = [
    [
      "A small scan. A big opening.",
      "A QR code on your counter, table or receipt makes it easy for customers to share how their visit felt.",
    ],
    [
      "Help the words come naturally.",
      "Customers choose their rating and describe their experience. An optional AI draft helps them find the words.",
    ],
    [
      "Let the customer take it from here.",
      "They can edit their draft and choose to post on Google. Their experience, their account, their decision.",
    ],
  ];
  return (
    <section id="experience" className="p-section p-experience">
      <div className="p-section-top">
        <Eyebrow>SMALL MOMENTS. LASTING IMPRESSIONS.</Eyebrow>
        <span className="p-section-index">01 / THE EXPERIENCE</span>
      </div>
      <div className="p-experience-grid">
        <div>
          <h2>
            From “that was great”
            <br />
            to <em>great things.</em>
          </h2>
          <p className="p-section-intro">
            Make sharing a good experience feel as natural as having one.
          </p>
          <div className="p-steps" role="tablist" aria-label="Customer journey">
            {steps.map(([title, description], i) => (
              <button
                key={title}
                id={`p-step-${i}`}
                className={`p-step ${step === i ? "p-step-active" : ""}`}
                role="tab"
                aria-selected={step === i}
                aria-controls="p-step-panel"
                tabIndex={step === i ? 0 : -1}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowDown" || event.key === "ArrowRight"
                      ? (i + 1) % 3
                      : event.key === "ArrowUp" || event.key === "ArrowLeft"
                        ? (i + 2) % 3
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 2
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    setStep(next);
                    document.getElementById(`p-step-${next}`)?.focus();
                  }
                }}
                onClick={() => setStep(i)}
              >
                <span className="p-step-num">0{i + 1}</span>
                <span>
                  <strong>{title}</strong>
                  {step === i && (
                    <span className="p-step-description">{description}</span>
                  )}
                </span>
                <Icon name={step === i ? "arrow" : "plus"} size={18} />
              </button>
            ))}
          </div>
          <Link to={`${ROOT}/review`} className="p-text-link">
            Try it as a customer <Icon />
          </Link>
        </div>
        <div
          className="p-phone-stage"
          role="tabpanel"
          id="p-step-panel"
          aria-labelledby={`p-step-${step}`}
        >
          <div className="p-phone-halo" />
          <span className="p-phone-side-text">
            A LITTLE LESS FRICTION. A LOT MORE FEELING.
          </span>
          <MiniPhone step={step} />
          <div className="p-phone-sticker">
            human first.
            <br />
            <b>always.</b>
            <span>✳</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chart({ compact = false, period = "month" }) {
  const values =
    period === "week"
      ? [36, 49, 40, 68, 59, 78, 92]
      : [24, 38, 31, 47, 41, 60, 52, 70, 65, 81, 73, 94];
  return (
    <div
      className={`p-chart ${compact ? "p-chart-compact" : ""}`}
      role="img"
      aria-label={`Sample ${period === "week" ? "weekly" : "monthly"} review activity, showing an upward trend`}
    >
      <div className="p-chart-grid">
        <span>40</span>
        <span>30</span>
        <span>20</span>
        <span>10</span>
      </div>
      <div className="p-chart-bars">
        {values.map((v, i) => (
          <div className="p-chart-bar-wrap" key={`${period}-${i}`}>
            <div
              className="p-chart-bar"
              style={{ "--height": `${v}%`, "--delay": `${i * 35}ms` }}
            >
              <span>{Math.round(v * 0.4)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-chart-labels">
        <span>{period === "week" ? "Mon" : "01 OCT"}</span>
        <span>{period === "week" ? "Thu" : "15 OCT"}</span>
        <span>{period === "week" ? "Sun" : "31 OCT"}</span>
      </div>
    </div>
  );
}

function Toolkit() {
  return (
    <section id="toolkit" className="p-toolkit">
      <div className="p-section">
        <div className="p-section-top">
          <Eyebrow light>THE BIG PICTURE. THE LITTLE DETAILS.</Eyebrow>
          <span className="p-section-index">02 / YOUR TOOLKIT</span>
        </div>
        <div className="p-toolkit-heading">
          <h2>
            Good words.
            <br />
            <em>Meet good insight.</em>
          </h2>
          <p>
            You put your heart into your business.
            <br />
            Here’s a clearer picture of what comes back.
          </p>
        </div>
        <div className="p-toolkit-grid">
          <Link to={`${ROOT}/studio`} className="p-feature p-feature-main">
            <div className="p-feature-title">
              <span>01 / REPUTATION AT A GLANCE</span>
              <Icon name="diagonal" />
            </div>
            <div className="p-mini-dashboard">
              <div className="p-mini-dash-top">
                <span>
                  <span className="p-live-dot" /> BLOOM COFFEE
                </span>
                <span>Sample overview</span>
              </div>
              <div className="p-mini-metrics">
                <div>
                  <small>Customer rating</small>
                  <strong>
                    4.9<span> / 5</span>
                  </strong>
                  <Stars />
                </div>
                <div>
                  <small>Reviews this month</small>
                  <strong>
                    128<span> ↗</span>
                  </strong>
                  <span className="p-up">A month of good conversations</span>
                </div>
              </div>
              <Chart compact />
            </div>
            <h3>Your reputation, in focus.</h3>
            <p>
              Follow your review activity and customer sentiment in one
              thoughtfully organised workspace.
            </p>
          </Link>
          <div className="p-feature-stack">
            <Link
              to={`${ROOT}/studio/competitors`}
              className="p-feature p-feature-map"
            >
              <div className="p-feature-title">
                <span>02 / KNOW YOUR NEIGHBOURHOOD</span>
                <Icon name="diagonal" />
              </div>
              <div className="p-map-art">
                <div className="p-map-road p-road-a" />
                <div className="p-map-road p-road-b" />
                <div className="p-map-road p-road-c" />
                <span className="p-map-pin p-map-you">
                  <Icon name="pin" />
                  You <b>4.9 ★</b>
                </span>
                <span className="p-map-pin p-map-other">
                  Nearby <b>4.6 ★</b>
                </span>
                <span className="p-map-tree p-tree-a">✳</span>
                <span className="p-map-tree p-tree-b">✳</span>
                <span className="p-map-caption">ILLUSTRATIVE LOCAL VIEW</span>
              </div>
              <h3>A little local perspective.</h3>
              <p>Track nearby competitors and see your business in context.</p>
            </Link>
            <Link
              to={`${ROOT}/studio/reviews`}
              className="p-feature p-feature-feedback"
            >
              <div className="p-feature-title">
                <span>03 / LISTEN A LITTLE CLOSER</span>
                <Icon name="diagonal" />
              </div>
              <div className="p-feedback-quote">
                <span>“</span>It’s the little things that bring us back.
              </div>
              <h3>Feedback worth hearing.</h3>
              <p>
                Keep customer feedback close. Spot themes, celebrate what works,
                and find room to improve.
              </p>
            </Link>
          </div>
        </div>
        <div className="p-toolkit-bottom">
          <span>
            QR codes. Review drafts. Feedback. Competitor tracking. Multiple
            locations.
          </span>
          <Link to={`${ROOT}/studio`} className="p-text-link">
            Step inside your workspace <Icon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="p-section p-pricing">
      <div className="p-section-top">
        <Eyebrow>GOOD FOR YOUR BUSINESS. EASY ON YOUR DAY.</Eyebrow>
        <span className="p-section-index">03 / KEEP IT SIMPLE</span>
      </div>
      <div className="p-pricing-grid">
        <div>
          <h2>
            Big on possibility.
            <br />
            <em>Small on price.</em>
          </h2>
          <p className="p-section-intro">
            One plan. The whole toolkit.
            <br />
            More time to do what you do best.
          </p>
          <div className="p-price-note">
            <span>✳</span>
            <p>
              Built for the businesses
              <br />
              that make a neighbourhood.
            </p>
          </div>
        </div>
        <div className="p-price-card">
          <div className="p-price-card-top">
            <span className="p-micro">THE PRAISLY PLAN</span>
            <span className="p-pill">7-day free trial</span>
          </div>
          <div className="p-price-toggle" aria-label="Billing period">
            <button aria-pressed={!yearly} onClick={() => setYearly(false)}>
              Monthly
            </button>
            <button aria-pressed={yearly} onClick={() => setYearly(true)}>
              Yearly <span>Save ₹998</span>
            </button>
          </div>
          <div className="p-price">
            <span>₹</span>
            {yearly ? "416" : "499"}
            <small>/ month{yearly && " equivalent"}</small>
          </div>
          <p className="p-price-billed">
            {yearly
              ? "₹4,990 billed yearly. Monthly equivalent rounded."
              : "₹499 billed monthly. Cancel renewal anytime."}
          </p>
          <div className="p-price-features">
            {[
              "Unlimited review requests",
              "AI-assisted review drafts",
              "QR code for your business",
              "Customer feedback & analytics",
              "Competitor tracking",
              "One business location",
            ].map((x) => (
              <span key={x}>
                <Icon name="check" size={17} />
                {x}
              </span>
            ))}
          </div>
          <Button to={`${ROOT}/studio`}>Take the toolkit for a spin</Button>
          <span className="p-price-fine">
            Preview only · no account or payment needed
          </span>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  const [paused, setPaused] = useState(false);
  return (
    <div className={`p-landing ${paused ? "p-motion-paused" : ""}`}>
      <Header />
      <main>
        <section className="p-hero">
          <div className="p-hero-copy">
            <Eyebrow>FOR THE LOVE OF LOCAL BUSINESS</Eyebrow>
            <h1>
              Good business.
              <br />
              Great{" "}
              <span className="p-word-reputation">
                reputation
                <svg
                  viewBox="0 0 600 30"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M5 20Q250-5 590 12M55 27Q340 5 565 22" />
                </svg>
              </span>
              <span className="p-orange">.</span>
            </h1>
            <p>
              You make someone’s day.
              <br />
              Let’s make sure the neighbourhood hears about it.
            </p>
            <div className="p-hero-actions">
              <Button to={`${ROOT}/studio`}>Meet your new workspace</Button>
              <a href="#experience" className="p-play-link">
                <span>↘</span>See how it feels
              </a>
            </div>
            <div className="p-hero-foot">
              <span className="p-mini-star">✳</span>
              <span>
                Real experiences. Human voices.
                <br />
                <b>A little help from Praisly.</b>
              </span>
            </div>
          </div>
          <ReputationSculpture />
          <div className="p-hero-bottom">
            <span>MADE FOR THE PLACES WE COME BACK TO.</span>
            <button
              className="p-motion-control"
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
            >
              {paused ? "▶ Resume motion" : "Ⅱ Pause motion"}
            </button>
            <a href="#experience" aria-label="Explore below">
              <Icon name="arrow" />
            </a>
          </div>
        </section>
        <div className="p-neighbourhood">
          <span>A LITTLE LOVE FOR EVERY LOCAL</span>
          <div className="p-business-types">
            <span>
              coffee shops <b>✳</b>
            </span>
            <span>
              clinics <b>✳</b>
            </span>
            <span>
              salons <b>✳</b>
            </span>
            <span>
              restaurants <b>✳</b>
            </span>
            <span>
              fitness studios <b>✳</b>
            </span>
          </div>
        </div>
        <Experience />
        <Toolkit />
        <section className="p-manifesto p-section">
          <Eyebrow>YOU DO THE EXTRAORDINARY, EVERY DAY.</Eyebrow>
          <p>
            The perfect cup.
            <br />
            The reassuring smile.
            <br />
            The extra five minutes.
          </p>
          <h2>
            That’s your reputation.
            <br />
            <em>Let it speak.</em>
            <span>✳</span>
          </h2>
          <span className="p-manifesto-note">
            Technology should help the human part shine.
          </span>
        </section>
        <Pricing />
        <section className="p-section p-faq">
          <div>
            <Eyebrow>A FEW THINGS YOU MIGHT WONDER</Eyebrow>
            <h2>
              Good questions.
              <br />
              <em>Clear answers.</em>
            </h2>
          </div>
          <div className="p-faq-list">
            {faq.map(([q, a], i) => (
              <details key={q}>
                <summary>
                  <span className="p-faq-num">0{i + 1}</span>
                  {q}
                  <Icon name="plus" size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="p-final-cta">
          <span className="p-cta-star">✳</span>
          <Eyebrow>YOUR NEXT CHAPTER STARTS WITH A GOOD WORD.</Eyebrow>
          <h2>
            Worth coming back to.
            <br />
            <em>Worth talking about.</em>
          </h2>
          <Button to={`${ROOT}/studio`}>See what’s possible</Button>
          <span>Explore the interactive Praisly preview.</span>
        </section>
      </main>
      <footer className="p-footer">
        <Brand />
        <p>A little help. A lot of good words.</p>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <span>© {new Date().getFullYear()} Praisly</span>
        </div>
      </footer>
    </div>
  );
}

function PreviewRibbon() {
  return (
    <div className="p-preview-ribbon">
      <span>
        <b>DESIGN PREVIEW</b>
        <span className="p-ribbon-detail"> A new chapter for Praisly.</span>
      </span>
      <Link to={ROOT}>Website</Link>
      <Link to={`${ROOT}/studio`}>Workspace</Link>
      <Link to={`${ROOT}/review`}>Customer flow</Link>
    </div>
  );
}

function ReviewRow({ review, expanded = false }) {
  return (
    <article className={`p-review-row ${expanded ? "p-review-expanded" : ""}`}>
      <span className={`p-avatar p-${review.tone}`}>{review.initials}</span>
      <div>
        <div className="p-review-name">
          <strong>{review.name}</strong>
          <span>{review.time}</span>
        </div>
        <Stars rating={review.rating} />
        <p>{review.text}</p>
        {expanded && (
          <span className="p-review-service">
            {review.service} · Sample review
          </span>
        )}
      </div>
      <span className="p-google">G</span>
    </article>
  );
}

function Overview({ location }) {
  const [period, setPeriod] = useState("month");
  const [exported, setExported] = useState(false);
  const exportReport = () => {
    const rows = [
      "Name,Rating,Review",
      ...samples.map(
        (r) => `${r.name},${r.rating},"${r.text.replaceAll('"', '""')}"`,
      ),
    ];
    const url = URL.createObjectURL(
      new Blob([rows.join("\r\n")], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "praisly-sample-reviews.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  };
  return (
    <>
      <div className="p-workspace-heading">
        <div>
          <Eyebrow>YOUR REPUTATION, IN FOCUS</Eyebrow>
          <h1>
            Good things are brewing<span>.</span>
          </h1>
          <p>Here’s the word around {location}.</p>
        </div>
        <button className="p-outline-button" onClick={exportReport}>
          <Icon name="download" size={16} />
          {exported ? "Sample exported" : "Export sample"}
        </button>
      </div>
      <div className="p-metric-grid">
        {[
          [
            "Customer rating",
            location === "Bloom Coffee" ? "4.9" : "4.8",
            "Out of 5 stars",
            "star",
          ],
          [
            "Reviews this month",
            location === "Bloom Coffee" ? "128" : "86",
            "Customer stories, collected",
            "review",
          ],
          [
            "QR visits",
            location === "Bloom Coffee" ? "342" : "219",
            "A small scan starts it all",
            "grid",
          ],
          ["Locations", "2", "A growing neighbourhood", "pin"],
        ].map(([title, value, desc, icon]) => (
          <div className="p-metric" key={title}>
            <div>
              <span>{title}</span>
              <Icon name={icon} size={18} />
            </div>
            <strong>{value}</strong>
            <small>{desc}</small>
          </div>
        ))}
      </div>
      <div className="p-workspace-grid">
        <section className="p-panel p-activity">
          <div className="p-panel-heading">
            <div>
              <h2>The conversation is growing.</h2>
              <p>Review activity · illustrative data</p>
            </div>
            <select
              aria-label="Chart period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="month">This month</option>
              <option value="week">This week</option>
            </select>
          </div>
          <Chart period={period} />
        </section>
        <section className="p-insight">
          <span className="p-insight-star">✳</span>
          <span className="p-micro">THE LITTLE THINGS ADD UP</span>
          <h2>
            Good service.
            <br />
            Great coffee.
            <br />
            <em>Warm welcomes.</em>
          </h2>
          <p>
            These are the themes coming through in your sample customer
            feedback.
          </p>
          <Link to={`${ROOT}/studio/reviews`}>
            Hear their stories <Icon />
          </Link>
        </section>
      </div>
      <div className="p-workspace-grid p-workspace-grid-bottom">
        <section className="p-panel">
          <div className="p-panel-heading">
            <div>
              <h2>A little love, lately.</h2>
              <p>The latest voices from your community</p>
            </div>
            <Link to={`${ROOT}/studio/reviews`} className="p-small-link">
              View all <Icon size={16} />
            </Link>
          </div>
          {samples.slice(0, 2).map((r) => (
            <ReviewRow key={r.name} review={r} />
          ))}
        </section>
        <Link className="p-qr-prompt" to={`${ROOT}/studio/qr`}>
          <span className="p-qr-prompt-icon">
            <Icon name="grid" size={45} />
          </span>
          <div>
            <span className="p-micro">SMALL SCAN. BIG POTENTIAL.</span>
            <h2>
              Put a good word
              <br />
              within reach.
            </h2>
            <p>Create a QR moment for your counter.</p>
          </div>
          <span className="p-circle-arrow">
            <Icon name="diagonal" />
          </span>
        </Link>
      </div>
    </>
  );
}

function ReviewInbox() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState(false);
  const filtered = samples.filter(
    (r) =>
      (filter === "all" || r.rating === Number(filter)) &&
      `${r.name} ${r.text}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="p-workspace-heading">
        <div>
          <Eyebrow>EVERY VOICE IS WORTH HEARING</Eyebrow>
          <h1>
            Your customer stories<span>.</span>
          </h1>
          <p>The compliments, the details, and the things to make better.</p>
        </div>
      </div>
      <div className="p-inbox-tabs">
        <button aria-pressed={!feedback} onClick={() => setFeedback(false)}>
          Review stories <span>3</span>
        </button>
        <button aria-pressed={feedback} onClick={() => setFeedback(true)}>
          Private feedback <span>1</span>
        </button>
      </div>
      {feedback ? (
        <section className="p-panel p-private-feedback">
          <span className="p-pill">Private · sample feedback</span>
          <h2>“A lovely space. The wait was a little long.”</h2>
          <p>
            We visited on Saturday morning and waited about 20 minutes. The
            coffee was worth it, but a heads-up on the wait would have helped.
          </p>
          <div className="p-feedback-action">
            <Icon name="review" />
            <span>Something to bring to your next team catch-up.</span>
          </div>
        </section>
      ) : (
        <>
          <div className="p-inbox-tools">
            <input
              type="search"
              placeholder="Find a name or a good word…"
              aria-label="Search reviews"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label="Filter reviews by rating"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
            </select>
          </div>
          <section className="p-panel">
            {filtered.map((r) => (
              <ReviewRow key={r.name} review={r} expanded />
            ))}
            {!filtered.length && (
              <div className="p-empty">
                <Icon name="review" size={36} />
                <h2>No matching stories.</h2>
                <p>Try a different name, word or rating.</p>
                <button
                  className="p-text-link"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear filters <Icon />
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

function QRStudio({ location }) {
  const [color, setColor] = useState("#ed582c");
  const [label, setLabel] = useState("Loved your visit?");
  const ref = useRef(null);
  const qr = useRef(null);
  useEffect(() => {
    const code = new QRCodeStyling({
      width: 210,
      height: 210,
      data: `${window.location.origin}${ROOT}/review`,
      dotsOptions: { color, type: "rounded" },
      cornersSquareOptions: { type: "extra-rounded" },
      backgroundOptions: { color: "#ffffff" },
      qrOptions: { errorCorrectionLevel: "M" },
    });
    ref.current.replaceChildren();
    code.append(ref.current);
    qr.current = code;
  }, [color]);
  return (
    <>
      <div className="p-workspace-heading">
        <div>
          <Eyebrow>A SMALL INVITATION TO SAY SOMETHING GOOD</Eyebrow>
          <h1>
            Your next good word starts here<span>.</span>
          </h1>
          <p>A working QR code that opens this sample customer experience.</p>
        </div>
      </div>
      <div className="p-qr-studio">
        <section className="p-panel p-qr-controls">
          <h2>Make it feel like you.</h2>
          <label htmlFor="qr-headline">Your invitation</label>
          <input
            id="qr-headline"
            value={label}
            maxLength={48}
            onChange={(e) => setLabel(e.target.value)}
          />
          <span className="p-field-label">Pick a colour</span>
          <div className="p-color-options">
            {["#ed582c", "#202c27", "#715a8d", "#171a17"].map((c) => (
              <button
                key={c}
                style={{ background: c }}
                aria-label={`Use ${c} QR colour`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
              >
                {color === c && <Icon name="check" />}
              </button>
            ))}
          </div>
          <Button
            onClick={() =>
              qr.current?.download({
                name: "praisly-preview-qr",
                extension: "png",
              })
            }
          >
            Download QR code
          </Button>
          <Link className="p-text-link" to={`${ROOT}/review`}>
            Test the customer experience <Icon />
          </Link>
          <p className="p-form-note">
            This QR opens the preview at its current address. A localhost QR
            works on this computer; use the deployed preview address to test it
            on a phone.
          </p>
        </section>
        <div className="p-qr-print-stage">
          <div className="p-qr-print">
            <span className="p-cafe-mark">b.</span>
            <span className="p-micro">{location.toUpperCase()}</span>
            <h2>{label || "A little feedback?"}</h2>
            <p>
              A few words from you.
              <br />A world of difference to us.
            </p>
            <div className="p-real-qr" ref={ref} />
            <span className="p-qr-scan">SCAN. SHARE. MAKE OUR DAY. ↗</span>
            <Brand />
          </div>
          <span className="p-qr-stage-note">COUNTER CARD · DESIGN PREVIEW</span>
        </div>
      </div>
    </>
  );
}

function Competitors() {
  const [area, setArea] = useState("Indiranagar");
  return (
    <>
      <div className="p-workspace-heading">
        <div>
          <Eyebrow>A LITTLE LOCAL PERSPECTIVE</Eyebrow>
          <h1>
            Meet your neighbourhood<span>.</span>
          </h1>
          <p>See where you stand, and keep a little context close.</p>
        </div>
        <select
          aria-label="Neighbourhood"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          <option>Indiranagar</option>
          <option>Koramangala</option>
        </select>
      </div>
      <div className="p-competitor-banner">
        <span className="p-insight-star">✳</span>
        <div>
          <span className="p-micro">
            {area.toUpperCase()} · SAMPLE COMPARISON
          </span>
          <h2>
            Local is a community.
            <br />
            <em>Get to know yours.</em>
          </h2>
        </div>
        <div className="p-local-marker">
          <Icon name="pin" size={44} />
          <span>YOU ARE HERE</span>
        </div>
      </div>
      <section className="p-panel p-competitor-table">
        <div className="p-table-row p-table-head">
          <span>Business</span>
          <span>Rating</span>
          <span>Reviews</span>
        </div>
        {[
          [
            area === "Indiranagar" ? "Bloom Coffee" : "Bloom Garden",
            "4.9",
            "328",
            true,
          ],
          ["Sunday Social", "4.6", "412", false],
          ["The Little Roastery", "4.7", "246", false],
          ["Corner Cup", "4.5", "187", false],
        ].map(([name, rating, reviews, own]) => (
          <div className="p-table-row" key={name}>
            <span>
              <span className={`p-avatar ${own ? "p-peach" : "p-sage"}`}>
                {name.slice(0, 1)}
              </span>
              <strong>{name}</strong>
              {own && <span className="p-pill">You</span>}
            </span>
            <span>
              <b>{rating}</b> <span className="p-orange">★</span>
            </span>
            <span>{reviews}</span>
          </div>
        ))}
      </section>
      <p className="p-form-note">
        Illustrative businesses and numbers. In the connected product, this view
        uses your tracked competitors.
      </p>
    </>
  );
}

function PreviewBilling() {
  const [cancelled, setCancelled] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <div className="p-workspace-heading">
        <div>
          <Eyebrow>ROOM TO KEEP GROWING</Eyebrow>
          <h1>
            Simple plan. Clear details<span>.</span>
          </h1>
          <p>
            A preview of your subscription controls. No payments are made here.
          </p>
        </div>
      </div>
      <div className="p-billing-demo">
        <section className="p-panel p-billing-plan">
          <div className="p-panel-heading">
            <span className="p-micro">YOUR SAMPLE PLAN</span>
            <span className="p-pill">
              {cancelled ? "Renewal cancelled" : "Monthly · active"}
            </span>
          </div>
          <h2>All the good stuff.</h2>
          <div className="p-price">
            <span>₹</span>499<small>/ month</small>
          </div>
          <p>One location. The complete Praisly toolkit.</p>
          <div className="p-billing-status">
            <Icon name="check" />
            {cancelled
              ? "Paid access stays available until the sample period ends."
              : "Renewal active in this demo. Cancel anytime."}
          </div>
          {!cancelled && !confirm && (
            <button
              className="p-outline-button"
              onClick={() => setConfirm(true)}
            >
              Cancel renewal
            </button>
          )}
          {confirm && (
            <div className="p-confirm" role="alert">
              <strong>Cancel this sample renewal?</strong>
              <p>
                In the real app, this also stops extra-location renewals. Paid
                time remains available.
              </p>
              <div>
                <button
                  className="p-outline-button"
                  onClick={() => setConfirm(false)}
                >
                  Keep plan
                </button>
                <button
                  className="p-button"
                  onClick={() => {
                    setCancelled(true);
                    setConfirm(false);
                  }}
                >
                  Confirm cancellation
                </button>
              </div>
            </div>
          )}
          {cancelled && (
            <button className="p-text-link" onClick={() => setCancelled(false)}>
              Reset this demo <Icon />
            </button>
          )}
        </section>
        <section className="p-billing-aside">
          <Icon name="sun" size={44} />
          <h2>
            Nothing hidden.
            <br />
            Nothing complicated.
          </h2>
          <p>
            Your subscription belongs to your account. Paid extra locations have
            their own capacity, and your data stays with you when access
            expires.
          </p>
          <p className="p-form-note">
            This panel simulates cancellation locally. It does not change your
            real subscription.
          </p>
        </section>
      </div>
    </>
  );
}

function Studio() {
  const [location, setLocation] = useState("Bloom Coffee");
  const links = [
    ["", "grid", "Overview"],
    ["/reviews", "review", "Customer stories"],
    ["/qr", "grid", "QR studio"],
    ["/competitors", "chart", "Neighbourhood"],
    ["/billing", "wallet", "Plan & billing"],
  ];
  return (
    <div className="p-studio">
      <aside className="p-sidebar">
        <Brand dark />
        <div className="p-workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Workspace navigation">
          {links.map(([path, icon, name]) => (
            <NavLink
              aria-label={name}
              title={name}
              key={path}
              to={`${ROOT}/studio${path}`}
              end
              className={({ isActive }) =>
                isActive ? "p-side-link p-side-active" : "p-side-link"
              }
            >
              <Icon name={icon} size={18} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-sidebar-note">
          <span>✳</span>
          <strong>
            Small moments.
            <br />
            Good things.
          </strong>
          <p>
            Keep doing what makes
            <br />
            your business, yours.
          </p>
        </div>
        <Link to={ROOT} className="p-sidebar-back">
          Back to the website <Icon size={16} />
        </Link>
        <div className="p-sidebar-user">
          <span className="p-avatar p-peach">BC</span>
          <div>
            <strong>Bloom Coffee</strong>
            <small>Sample workspace</small>
          </div>
        </div>
      </aside>
      <div className="p-workspace-body">
        <header className="p-workspace-top">
          <div>
            <Icon name="pin" size={17} />
            <select
              aria-label="Active location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>Bloom Coffee</option>
              <option>Bloom Garden</option>
            </select>
            <span className="p-location-city">Bengaluru</span>
          </div>
          <span className="p-demo-status">
            <span className="p-live-dot" />
            Interactive demo · sample data
          </span>
        </header>
        <main className="p-workspace-main">
          <Routes>
            <Route index element={<Overview location={location} />} />
            <Route path="reviews" element={<ReviewInbox />} />
            <Route path="qr" element={<QRStudio location={location} />} />
            <Route path="competitors" element={<Competitors />} />
            <Route path="billing" element={<PreviewBilling />} />
            <Route
              path="*"
              element={
                <div className="p-empty">
                  <h1>Let’s get you back.</h1>
                  <Button to={`${ROOT}/studio`}>Open overview</Button>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="p-workspace-footer">
          <span>A little clarity for your everyday.</span>
          <b>praisly.</b>
        </footer>
      </div>
    </div>
  );
}

function CustomerExperience() {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [drafted, setDrafted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const isPositive = rating >= 4;
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className="p-customer">
      <div className="p-customer-decor">✳</div>
      <Link className="p-customer-back" to={ROOT}>
        ← Back to Praisly
      </Link>
      <div className="p-customer-card">
        <span className="p-cafe-mark">b.</span>
        <span className="p-micro">BLOOM COFFEE · SAMPLE EXPERIENCE</span>
        <div
          className="p-customer-progress"
          aria-label={`Step ${step + 1} of 3`}
        >
          {[0, 1, 2].map((i) => (
            <span className={i <= step ? "active" : ""} key={i} />
          ))}
        </div>
        {step === 0 ? (
          <>
            <Eyebrow>A LITTLE FEEDBACK GOES A LONG WAY</Eyebrow>
            <h1>
              How was
              <br />
              <em>your little escape?</em>
            </h1>
            <p>
              Thanks for stopping by. We’d love to know how your visit felt.
            </p>
            <div
              className="p-rating-picker"
              role="group"
              aria-label="Rate your visit"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  aria-label={`${i} star${i === 1 ? "" : "s"}`}
                  aria-pressed={rating === i}
                  className={i <= rating ? "selected" : ""}
                  onClick={() => setRating(i)}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="p-rating-caption" aria-live="polite">
              {
                [
                  "Pick the stars that feel right.",
                  "We’re listening.",
                  "Tell us what we can do better.",
                  "Thanks for being honest.",
                  "That’s lovely to hear.",
                  "You just made our day.",
                ][rating]
              }
            </span>
            <Button disabled={!rating} onClick={() => setStep(1)}>
              A few more words
            </Button>
          </>
        ) : step === 1 ? (
          <>
            <h1>
              {isPositive ? (
                <>
                  Good moments.
                  <br />
                  <em>Your own words.</em>
                </>
              ) : (
                <>
                  We’re listening.
                  <br />
                  <em>Tell us more.</em>
                </>
              )}
            </h1>
            <p>
              {isPositive
                ? "What made your visit memorable? You’re always in charge of what you share."
                : "What could we have done better? Your feedback helps the team improve."}
            </p>
            <label htmlFor="p-customer-name">
              Your first name <span>(optional)</span>
            </label>
            <input
              id="p-customer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              maxLength={60}
            />
            <label htmlFor="p-customer-words">
              {isPositive ? "Your review" : "Your private feedback"}
            </label>
            <textarea
              id="p-customer-words"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setCopied(false);
              }}
              maxLength={2000}
              rows={4}
              placeholder="The little details matter…"
            />
            {isPositive && (
              <button
                className="p-draft-button"
                onClick={() => {
                  setText(
                    text.trim()
                      ? `${text.trim()} A lovely experience at Bloom Coffee.`
                      : "I enjoyed my visit to Bloom Coffee. The coffee was lovely and the team made me feel welcome.",
                  );
                  setDrafted(true);
                }}
              >
                <span>✧</span>
                {drafted
                  ? "Refresh sample draft"
                  : "Try a sample AI-assisted draft"}
              </button>
            )}
            {drafted && (
              <p className="p-draft-note">
                This is a preset demo draft. Edit it so it reflects your actual
                experience.
              </p>
            )}
            <Button disabled={!text.trim()} onClick={() => setStep(2)}>
              {isPositive ? "Review before sharing" : "Send sample feedback"}
            </Button>
            <button className="p-customer-secondary" onClick={() => setStep(0)}>
              ← Change my rating
            </button>
          </>
        ) : (
          <>
            <span className="p-customer-success">
              <Icon name="check" size={30} />
            </span>
            <h1>
              {isPositive ? (
                <>
                  A good word.
                  <br />
                  <em>A real difference.</em>
                </>
              ) : (
                <>
                  Thank you
                  <br />
                  <em>for being honest.</em>
                </>
              )}
            </h1>
            <p>
              {isPositive
                ? `${name ? `${name}, your` : "Your"} words are ready. In the live flow, you choose whether to share them on Google.`
                : "Your sample feedback is complete. In the live product, it would go privately to the business."}
            </p>
            <blockquote>{text}</blockquote>
            {isPositive && (
              <>
                <button className="p-outline-button" onClick={copy}>
                  <Icon name="review" size={17} />
                  {copied ? "Review copied" : "Copy my review"}
                </button>
                {copyError && (
                  <p role="alert">
                    Clipboard unavailable. Select and copy your words above.
                  </p>
                )}
                <Button onClick={() => setHandoff(true)}>
                  Preview Google handoff
                </Button>
                {handoff && (
                  <div className="p-handoff" role="status">
                    <Icon name="check" />
                    <span>
                      That’s where Google would open. This demo stops
                      here—nothing has been posted.
                    </span>
                  </div>
                )}
                <button
                  className="p-customer-secondary"
                  onClick={() => {
                    setStep(1);
                    setHandoff(false);
                  }}
                >
                  Edit my words
                </button>
              </>
            )}
            <button
              className="p-customer-secondary"
              onClick={() => {
                setStep(0);
                setRating(0);
                setText("");
                setName("");
                setDrafted(false);
                setCopied(false);
                setHandoff(false);
              }}
            >
              Try the experience again ↗
            </button>
          </>
        )}
        <div className="p-customer-powered">
          A little help from <Brand />
        </div>
      </div>
      <p className="p-customer-disclaimer">
        Interactive design preview. Your input stays on this page.
      </p>
    </div>
  );
}

export default function Reimagined() {
  const location = useLocation();
  useEffect(() => {
    const originalTitle = document.title;
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    document.title = "Praisly — A new chapter · Design preview";
    return () => {
      document.title = originalTitle;
      robots.remove();
    };
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <div className="p-next">
      <a className="p-skip" href="#p-preview-content">
        Skip to content
      </a>
      <PreviewRibbon />
      <div id="p-preview-content" tabIndex={-1}>
        <Routes>
          <Route index element={<Landing />} />
          <Route path="studio/*" element={<Studio />} />
          <Route path="review" element={<CustomerExperience />} />
          <Route
            path="*"
            element={
              <div className="p-empty">
                <h1>This page is still a blank canvas.</h1>
                <Button to={ROOT}>Back to the preview</Button>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
