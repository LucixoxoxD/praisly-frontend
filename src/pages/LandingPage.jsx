import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

function Arrow({ diagonal = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spark({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m50 0 8 33 28-19-19 28 33 8-33 8 19 28-28-19-8 33-8-33-28 19 19-28L0 50l33-8-19-28 28 19Z" />
    </svg>
  );
}

function Stars() {
  return (
    <span className="pw-stars" aria-label="5 out of 5 stars">
      ★★★★★
    </span>
  );
}

function SculptedStar() {
  return (
    <svg
      className="pw-sculpture"
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="pw-metal"
          x1="100"
          y1="50"
          x2="390"
          y2="460"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff5be" />
          <stop offset=".26" stopColor="#ffc64d" />
          <stop offset=".52" stopColor="#ff9900" />
          <stop offset=".76" stopColor="#e37000" />
          <stop offset="1" stopColor="#9f3c00" />
        </linearGradient>
        <linearGradient
          id="pw-edge"
          x1="120"
          y1="0"
          x2="400"
          y2="460"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff1b0" />
          <stop offset=".47" stopColor="#ffcf65" />
          <stop offset="1" stopColor="#b74d00" />
        </linearGradient>
        <radialGradient id="pw-shine" cx=".28" cy=".25" r=".8">
          <stop stopColor="#fff9d1" />
          <stop offset=".4" stopColor="#ffce57" />
          <stop offset="1" stopColor="#ed8400" />
        </radialGradient>
        <linearGradient id="pw-polish" x1="0" y1="0" x2="1" y2=".4">
          <stop stopColor="#fff" stopOpacity="0" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fffbe1" stopOpacity=".65" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="pw-star-clip">
          <path d="m250 31 56 139 148 11-113 102 33 150-124-79-126 79 33-150L45 181l148-11Z" />
        </clipPath>
        <filter id="pw-shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow
            dx="8"
            dy="25"
            stdDeviation="16"
            floodColor="#963f00"
            floodOpacity=".18"
          />
        </filter>
      </defs>
      <g filter="url(#pw-shadow)" transform="rotate(-12 250 250)">
        <path
          d="m250 31 56 139 148 11-113 102 33 150-124-79-126 79 33-150L45 181l148-11Z"
          fill="#ac510a"
          transform="translate(0 15)"
        />
        <path
          d="m250 31 56 139 148 11-113 102 33 150-124-79-126 79 33-150L45 181l148-11Z"
          fill="url(#pw-metal)"
          stroke="url(#pw-edge)"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="m250 31 0 217 56-78ZM454 181l-204 67 91 35ZM374 433 250 248v106ZM124 433l126-185-93 35ZM45 181l205 67-57-78Z"
          fill="url(#pw-shine)"
        />
        <path
          d="m250 31 0 217L45 181m205 67 204-67M250 248 124 433m126-185 124 185"
          stroke="#fff2b8"
          strokeOpacity=".5"
          strokeWidth="1.5"
        />
        <g clipPath="url(#pw-star-clip)">
          <rect
            className="pw-star-sheen"
            x="-500"
            y="0"
            width="1000"
            height="500"
            fill="url(#pw-polish)"
          />
        </g>
      </g>
    </svg>
  );
}

function DecorativeQR() {
  return (
    <svg
      viewBox="0 0 25 25"
      className="pw-qr"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <rect width="25" height="25" fill="#fffcf4" />
      <g fill="#242720">
        {[
          [2, 2],
          [16, 2],
          [2, 16],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="7" height="7" rx=".5" />
            <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fffcf4" />
            <rect x={x + 2} y={y + 2} width="3" height="3" />
          </g>
        ))}
        {Array.from({ length: 169 }, (_, i) => {
          const x = 2 + (i % 13) * 1.6;
          const y = 2 + Math.floor(i / 13) * 1.6;
          return !(
            (x < 10 && y < 10) ||
            (x > 14 && y < 10) ||
            (x < 10 && y > 14)
          ) && (i * 7 + Math.floor(i / 13)) % 5 < 3 ? (
            <rect key={i} x={x} y={y} width="1.5" height="1.5" />
          ) : null;
        })}
      </g>
    </svg>
  );
}

const chapters = [
  {
    label: "The invitation",
    title: "A small scan.\nA lovely beginning.",
    text: "Your own QR code, ready for your counter, your table, or wherever good experiences happen.",
    word: "hello.",
  },
  {
    label: "The words",
    title: "Their experience.\nTheir own words.",
    text: "A little help finding the words. Customers can personalise an optional draft and choose what they share on Google.",
    word: "lovely.",
  },
  {
    label: "The bigger picture",
    title: "Every little detail.\nAll in one place.",
    text: "Review activity, private feedback, and nearby competitor comparisons. A clearer view of your business.",
    word: "closer.",
  },
];

function Showcase() {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  function onTabKey(event, index) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % 3
        : event.key === "ArrowLeft"
          ? (index + 2) % 3
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? 2
              : null;
    if (next !== null) {
      event.preventDefault();
      setActive(next);
      tabs.current[next]?.focus();
    }
  }
  return (
    <section
      className="pw-showcase"
      id="experience"
      aria-labelledby="pw-experience-title"
    >
      <div className="pw-wrap">
        <div className="pw-section-top">
          <span className="pw-kicker">01 / THE PRAISLY EXPERIENCE</span>
          <span className="pw-tiny">
            SMALL INTERACTIONS. LASTING IMPRESSIONS.
          </span>
        </div>
        <div className="pw-showcase-heading">
          <h2 id="pw-experience-title">
            Good things.
            <br />
            <em>Beautifully connected.</em>
          </h2>
          <Spark />
        </div>
        <div
          className="pw-chapter-tabs"
          style={{ "--chapter": active }}
          role="tablist"
          aria-label="Explore the Praisly experience"
        >
          <span className="pw-tab-ink" aria-hidden="true" />
          {chapters.map((chapter, i) => (
            <button
              key={chapter.label}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`pw-tab-${i}`}
              aria-selected={active === i}
              aria-controls="pw-chapter-panel"
              tabIndex={active === i ? 0 : -1}
              onKeyDown={(e) => onTabKey(e, i)}
              onClick={() => setActive(i)}
            >
              <span>0{i + 1}</span>
              {chapter.label}
              <Arrow diagonal />
            </button>
          ))}
        </div>
        <div
          className="pw-chapter"
          id="pw-chapter-panel"
          role="tabpanel"
          aria-labelledby={`pw-tab-${active}`}
          tabIndex="0"
        >
          <div className="pw-chapter-copy" key={`copy-${active}`}>
            <span className="pw-kicker">
              A MOMENT TO {["CONNECT", "EXPRESS", "UNDERSTAND"][active]}
            </span>
            <h3>
              {chapters[active].title.split("\n").map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h3>
            <p>{chapters[active].text}</p>
            <span className="pw-chapter-index">
              0{active + 1}
              <span> / 03</span>
            </span>
          </div>
          <div className={`pw-stage pw-stage-${active}`}>
            <span className="pw-stage-word" aria-hidden="true" key={active}>
              {chapters[active].word}
            </span>
            {active === 0 && (
              <div className="pw-table-card">
                <span className="pw-mini-logo">
                  praisly
                  <Spark />
                </span>
                <h4>
                  Made your day?
                  <br />
                  Make ours.
                </h4>
                <DecorativeQR />
                <span>A little feedback goes a long way.</span>
                <div className="pw-table-base" />
              </div>
            )}
            {active === 1 && (
              <div className="pw-phone">
                <div className="pw-phone-speaker" />
                <span className="pw-phone-brand">BLOOM COFFEE</span>
                <span className="pw-phone-avatar">b.</span>
                <h4>
                  A good visit.
                  <br />A few good words.
                </h4>
                <Stars />
                <div className="pw-draft">
                  “Such a lovely little spot. Great coffee, a warm welcome, and
                  a reason to come back.”
                  <span>
                    YOUR WORDS, WITH A LITTLE HELP{" "}
                    <span aria-hidden="true">↗</span>
                  </span>
                </div>
                <div className="pw-phone-action">
                  Make it yours <Arrow />
                </div>
              </div>
            )}
            {active === 2 && (
              <div className="pw-mini-dashboard">
                <div className="pw-mini-dash-top">
                  <span>
                    Bloom Coffee <span className="pw-status-dot" />
                  </span>
                  <span>Overview ↗</span>
                </div>
                <div className="pw-mini-dash-stats">
                  <div>
                    <span>Google rating</span>
                    <strong>
                      4.8<small> / 5</small>
                    </strong>
                  </div>
                  <div>
                    <span>Review drafts</span>
                    <strong>128</strong>
                  </div>
                </div>
                <div className="pw-chart-caption">
                  Review activity <span>LAST 7 DAYS</span>
                </div>
                <div className="pw-bars">
                  {[30, 50, 38, 70, 55, 85, 100].map((height, i) => (
                    <div key={i}>
                      <span
                        style={{
                          "--bar": `${height}%`,
                          "--delay": `${i * 70}ms`,
                        }}
                      />
                      <small>{["M", "T", "W", "T", "F", "S", "S"][i]}</small>
                    </div>
                  ))}
                </div>
                <div className="pw-dash-note">
                  <span>♡</span> The little details, together.
                </div>
              </div>
            )}
            <span className="pw-sample">
              PRODUCT ILLUSTRATION · SAMPLE DATA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

const questions = [
  [
    "What exactly is Praisly?",
    "Praisly brings QR review collection, AI-assisted drafts, private customer feedback, and competitor comparisons into one place for your local business.",
  ],
  [
    "Do customers need an app?",
    "No. Customers open your review page by scanning a QR code or following your link. To publish a Google review, they use their own Google account.",
  ],
  [
    "Who writes and posts the review?",
    "The customer stays in control. Praisly can suggest a draft, but the customer decides what to write and whether to post it on Google.",
  ],
  [
    "What happens to private feedback?",
    "Private feedback appears in your dashboard so you can understand the experience and decide how to follow up.",
  ],
  [
    "Can I cancel my subscription?",
    "Yes. You can cancel renewal from your billing page. Access continues until the end of the paid billing period.",
  ],
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [yearly, setYearly] = useState(false);
  const [motion, setMotion] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const root = useRef(null);
  const menuToggle = useRef(null);
  const [activeSection, setActiveSection] = useState("");

  // Keep pointer motion local to the illustration; no React renders per frame.
  useEffect(() => {
    const artwork = root.current.querySelector(".pw-hero-art");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    const animate = () => {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      artwork.style.setProperty("--pointer-x", x.toFixed(4));
      artwork.style.setProperty("--pointer-y", y.toFixed(4));
      frame =
        Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002
          ? requestAnimationFrame(animate)
          : 0;
    };
    const move = (event) => {
      if (
        !motion ||
        !pointer.matches ||
        reduced.matches ||
        event.pointerType === "touch"
      )
        return;
      const rect = artwork.getBoundingClientRect();
      targetX = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
      );
      targetY = Math.max(
        -1,
        Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
      if (!frame) frame = requestAnimationFrame(animate);
    };
    const reset = () => {
      targetX = targetY = 0;
      if (!frame) frame = requestAnimationFrame(animate);
    };
    artwork.addEventListener("pointermove", move, { passive: true });
    artwork.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      cancelAnimationFrame(frame);
      artwork.removeEventListener("pointermove", move);
      artwork.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
      artwork.style.removeProperty("--pointer-x");
      artwork.style.removeProperty("--pointer-y");
    };
  }, [motion]);

  useEffect(() => {
    const page = root.current;
    const sections = [...page.querySelectorAll("section[id]")];
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - innerHeight;
      page.style.setProperty(
        "--page-progress",
        height > 0 ? Math.min(1, scrollY / height) : 0,
      );
      const current = sections
        .filter(
          (section) =>
            section.getBoundingClientRect().top <= innerHeight * 0.35,
        )
        .at(-1);
      setActiveSection(current?.id ?? "");
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    queue();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Praisly — Good work. Great word of mouth.";
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = (e) => setMotion(!e.matches);
    media.addEventListener("change", updateMotion);
    const elements = root.current.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pw-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => {
      document.title = previousTitle;
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
    };
  }, []);
  const support = import.meta.env.VITE_SUPPORT_PHONE;
  return (
    <div className={`pw-site ${motion ? "pw-motion" : "pw-still"}`} ref={root}>
      <a href="#main-content" className="pw-skip">
        Skip to content
      </a>
      <header
        className="pw-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) {
            setMenuOpen(false);
            menuToggle.current?.focus();
          }
        }}
      >
        <div className="pw-wrap pw-nav">
          <Link to="/" className="pw-logo" aria-label="Praisly home">
            <Spark />
            praisly<span>.</span>
          </Link>
          <nav className="pw-desktop-nav" aria-label="Main navigation">
            <a
              href="#experience"
              aria-current={
                activeSection === "experience" ? "location" : undefined
              }
            >
              The experience
            </a>
            <a
              href="#features"
              aria-current={
                activeSection === "features" ? "location" : undefined
              }
            >
              The details
            </a>
            <a
              href="#pricing"
              aria-current={
                activeSection === "pricing" ? "location" : undefined
              }
            >
              Pricing
            </a>
          </nav>
          <div className="pw-nav-actions">
            <Link to="/login" className="pw-login">
              Log in <Arrow diagonal />
            </Link>
            <Link to="/signup" className="pw-button pw-button-small">
              Get started{" "}
              <span>
                <Arrow diagonal />
              </span>
            </Link>
            <button
              className="pw-menu-toggle"
              ref={menuToggle}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="pw-mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? "−" : "+"}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="pw-mobile-nav"
            className="pw-mobile-nav"
            aria-label="Mobile navigation"
          >
            {[
              ["The experience", "#experience"],
              ["The details", "#features"],
              ["Pricing", "#pricing"],
              ["Questions", "#questions"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
                <Arrow diagonal />
              </a>
            ))}
            <Link to="/login">
              Log in <Arrow diagonal />
            </Link>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section className="pw-hero pw-wrap" aria-labelledby="pw-hero-title">
          <div className="pw-hero-top">
            <span className="pw-kicker">
              <span className="pw-status-dot" /> GOOD BUSINESSES DESERVE TO BE
              HEARD.
            </span>
            <button
              className="pw-motion-toggle"
              onClick={() => setMotion((v) => !v)}
              aria-pressed={motion}
            >
              {motion ? "Pause" : "Play"} motion{" "}
              <span aria-hidden="true">{motion ? "Ⅱ" : "▷"}</span>
            </button>
          </div>
          <div className="pw-hero-layout">
            <div className="pw-hero-copy">
              <h1 id="pw-hero-title">
                <span className="pw-title-line">
                  <span>Good work.</span>
                </span>
                <span className="pw-title-line">
                  <span>
                    Great <em>word</em>
                  </span>
                </span>
                <span className="pw-title-line">
                  <span>
                    <em>of mouth.</em>
                    <span className="pw-title-dot" aria-hidden="true">
                      ✳
                    </span>
                  </span>
                </span>
              </h1>
              <p>
                You make their day.
                <br />
                We help them put it into words.
              </p>
              <div className="pw-hero-actions">
                <Link to="/signup" className="pw-button">
                  Meet your new reputation{" "}
                  <span>
                    <Arrow diagonal />
                  </span>
                </Link>
                <a href="#experience" className="pw-text-link">
                  Take a look <span>↓</span>
                </a>
              </div>
              <span className="pw-hero-footnote">
                MADE FOR LOCAL BUSINESSES. BUILT AROUND PEOPLE.
              </span>
            </div>
            <div
              className="pw-hero-art"
              role="img"
              aria-label="A sculpted golden star surrounded by sample review cards"
            >
              <div className="pw-orbit pw-orbit-one" />
              <div className="pw-orbit pw-orbit-two" />
              <div className="pw-art-axis" />
              <div className="pw-art-halo" />
              <div className="pw-art-shadow" />
              <span className="pw-art-coordinate">
                A LITTLE PRAISE
                <br />
                GOES A LONG WAY.
              </span>
              <div className="pw-star-depth">
                <SculptedStar />
              </div>
              <span
                className="pw-art-glint pw-art-glint-one"
                aria-hidden="true"
              >
                ✦
              </span>
              <span
                className="pw-art-glint pw-art-glint-two"
                aria-hidden="true"
              >
                ✧
              </span>
              <div className="pw-float-review">
                <div>
                  <span className="pw-avatar">a.</span>
                  <span>
                    A moment worth sharing<small>EXAMPLE CUSTOMER REVIEW</small>
                  </span>
                  <span className="pw-review-spark">✦</span>
                </div>
                <Stars />
                <p>
                  “The kind of place you
                  <br />
                  tell your friends about.”
                </p>
                <span className="pw-review-bottom">
                  Real experiences. Good words. <Arrow diagonal />
                </span>
              </div>
              <div className="pw-float-tag">
                <Spark />
                <span>
                  A good reputation
                  <br />
                  <strong>starts with you.</strong>
                </span>
              </div>
              <span className="pw-art-caption">
                THE EVERYDAY, EXTRAORDINARY.
              </span>
              <span className="pw-art-plus">+</span>
              <span className="pw-art-edition" aria-hidden="true">
                <span>01 — 05</span>
                <i />
                <span>A LITTLE BRILLIANCE.</span>
              </span>
            </div>
          </div>
          <div className="pw-hero-bottom">
            <span>LESS FRICTION. MORE FEELING.</span>
            <span>
              SCROLL TO FIND YOUR SPARK <span>↓</span>
            </span>
          </div>
        </section>

        <div
          className="pw-ribbon"
          aria-label="For cafés, salons, clinics, studios, and neighbourhood favourites"
        >
          <div className="pw-ribbon-track">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1}>
                {[
                  "Cafés",
                  "Salons",
                  "Clinics",
                  "Studios",
                  "Neighbourhood favourites",
                ].map((item) => (
                  <span key={item}>
                    {item}
                    <Spark />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="pw-intro pw-wrap" data-reveal>
          <span className="pw-kicker">YOU DO THE GOOD WORK.</span>
          <h2>
            Let the good words
            <br />
            <span>find their way</span> <em>out.</em>
            <Spark />
          </h2>
          <div className="pw-intro-bottom">
            <span className="pw-small-index">THE IDEA / 001</span>
            <p>
              That perfect coffee. The extra care. A familiar smile.
              <br />
              Praisly gives those everyday moments somewhere to go.
            </p>
          </div>
        </section>

        <Showcase />

        <section className="pw-features pw-wrap" id="features">
          <div className="pw-section-top">
            <span className="pw-kicker">
              02 / LITTLE DETAILS. BIG DIFFERENCE.
            </span>
            <span className="pw-tiny">THOUGHTFULLY PUT TOGETHER.</span>
          </div>
          <div className="pw-feature-heading" data-reveal>
            <h2>
              A little more
              <br />
              <em>thought in everything.</em>
            </h2>
            <p>
              From the first scan to the bigger picture.
              <br />
              Made to feel effortless.
            </p>
          </div>
          <div className="pw-feature-grid">
            <article className="pw-feature-card pw-feature-qr" data-reveal>
              <div className="pw-card-label">
                <span>01 / YOUR BRAND, FRONT & CENTRE</span>
                <Arrow diagonal />
              </div>
              <div className="pw-qr-stack" aria-hidden="true">
                <div className="pw-qr-back">
                  say
                  <br />
                  something
                  <br />
                  <em>lovely.</em>
                  <Spark />
                </div>
                <div className="pw-qr-front">
                  <span>
                    GOOD COFFEE?
                    <br />
                    GOOD WORDS.
                  </span>
                  <DecorativeQR />
                  <span>BLOOM COFFEE</span>
                </div>
              </div>
              <div className="pw-feature-text">
                <h3>
                  Small code.
                  <br />
                  Your whole personality.
                </h3>
                <p>Custom QR codes that feel right at home in your business.</p>
              </div>
            </article>
            <article
              className="pw-feature-card pw-feature-feedback"
              data-reveal
            >
              <div className="pw-card-label">
                <span>02 / A LITTLE CLOSER</span>
                <Arrow diagonal />
              </div>
              <div className="pw-note-art" aria-hidden="true">
                <span className="pw-note-pin" />
                <span className="pw-note-heart">♡</span>
                <p>
                  It's the little things.
                  <br />
                  Thanks for listening.
                </p>
                <span>A NOTE, JUST FOR YOU.</span>
              </div>
              <div className="pw-feature-text">
                <h3>
                  Hear the things
                  <br />
                  that matter.
                </h3>
                <p>
                  A private space for feedback. An opportunity to understand.
                </p>
              </div>
            </article>
            <article className="pw-feature-card pw-feature-wide" data-reveal>
              <div className="pw-feature-wide-copy">
                <div className="pw-card-label">
                  <span>03 / A FRESH PERSPECTIVE</span>
                  <Arrow diagonal />
                </div>
                <h3>
                  Your neighbourhood.
                  <br />
                  <em>In a new light.</em>
                </h3>
                <p>
                  See nearby businesses' ratings and review counts alongside
                  your own.
                </p>
                <span className="pw-tiny">
                  MORE CONTEXT. A CLEARER PICTURE.
                </span>
              </div>
              <div
                className="pw-neighbourhood"
                aria-label="Illustration of local business review comparisons"
              >
                <div className="pw-map-grid" />
                <div className="pw-map-road" />
                <div className="pw-map-dot pw-map-dot-a" />
                <div className="pw-map-dot pw-map-dot-b" />
                <div className="pw-map-pin">
                  <Spark />
                  <span>You are here.</span>
                </div>
                <div className="pw-map-card">
                  <span>
                    <span className="pw-map-icon">b.</span>Bloom Coffee{" "}
                    <span>↗</span>
                  </span>
                  <div>
                    <strong>
                      4.8 <span>★</span>
                    </strong>
                    <small>246 reviews</small>
                  </div>
                </div>
                <span className="pw-map-label">
                  A LITTLE LOOK AROUND · SAMPLE DATA
                </span>
              </div>
            </article>
          </div>
        </section>

        <section className="pw-pricing" id="pricing">
          <div className="pw-wrap pw-pricing-layout">
            <div className="pw-pricing-copy" data-reveal>
              <span className="pw-kicker">03 / KEEP IT SIMPLE</span>
              <h2>
                Good things.
                <br />
                <em>One little plan.</em>
              </h2>
              <p>
                Everything you need to bring your
                <br />
                customer experiences together.
              </p>
              <div className="pw-price-doodle" aria-hidden="true">
                <Spark />
                <span>
                  small investment.
                  <br />a lot to love.
                </span>
                <svg viewBox="0 0 180 100">
                  <path d="M8 10C80 90 114 1 134 30s-37 48-3 39l32-12m-24-10 27 8-15 27" />
                </svg>
              </div>
            </div>
            <div className="pw-price-card" data-reveal>
              <div className="pw-price-top">
                <span>THE WHOLE PACKAGE</span>
                <Spark />
              </div>
              <div
                className="pw-billing-toggle"
                role="group"
                aria-label="Billing frequency"
              >
                <button aria-pressed={!yearly} onClick={() => setYearly(false)}>
                  Monthly
                </button>
                <button aria-pressed={yearly} onClick={() => setYearly(true)}>
                  Yearly <span>2 months free</span>
                </button>
              </div>
              <div className="pw-price" aria-live="polite">
                <span>₹</span>
                <strong>{yearly ? "416" : "499"}</strong>
                <span>/ month</span>
              </div>
              <p className="pw-price-note">
                {yearly
                  ? "₹4,990 billed yearly · rounded monthly equivalent"
                  : "Billed monthly. Cancel renewal anytime."}
              </p>
              <div className="pw-price-line" />
              <ul>
                {[
                  "Custom QR codes & review requests",
                  "AI-assisted review drafts",
                  "Private customer feedback",
                  "Competitor comparisons",
                  "Review activity & analytics",
                ].map((feature) => (
                  <li key={feature}>
                    <span>↗</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="pw-button">
                Start your 7-day free trial{" "}
                <span>
                  <Arrow diagonal />
                </span>
              </Link>
              <span className="pw-price-foot">NO CREDIT CARD NEEDED</span>
            </div>
          </div>
        </section>

        <section className="pw-faq pw-wrap" id="questions">
          <div data-reveal>
            <span className="pw-kicker">04 / A FEW GOOD QUESTIONS</span>
            <h2>
              Glad
              <br />
              <em>you asked.</em>
            </h2>
            <span className="pw-faq-asterisk" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="pw-faq-list" data-reveal>
            {questions.map(([q, a], i) => (
              <details key={q}>
                <summary>
                  <span>0{i + 1}</span>
                  <h3>{q}</h3>
                  <span className="pw-faq-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="pw-footer">
          <div className="pw-wrap">
            <div className="pw-footer-top">
              <span className="pw-kicker">
                HERE'S TO YOUR NEXT GOOD REVIEW.
              </span>
              <a href="#main-content" className="pw-back-top">
                Back to top ↑
              </a>
            </div>
            <div className="pw-footer-cta">
              <h2>
                Give good work
                <br />
                <em>a little spotlight.</em>
              </h2>
              <Link
                to="/signup"
                className="pw-footer-circle"
                aria-label="Get started with Praisly"
              >
                <Arrow diagonal />
              </Link>
            </div>
            <div className="pw-footer-wordmark" aria-hidden="true">
              praisly
              <Spark />
            </div>
            <div className="pw-footer-bottom">
              <span>© 2026 PRAISLY · MADE FOR THE LOCAL GOOD.</span>
              <nav aria-label="Footer navigation">
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                {support && (
                  <a
                    href={`https://wa.me/${support}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Say hello <Arrow diagonal />
                  </a>
                )}
                <Link to="/login">Log in</Link>
              </nav>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
