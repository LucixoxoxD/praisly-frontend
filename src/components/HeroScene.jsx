import "./HeroScene.css";

// A product vignette, not a live customer submission or a working QR code.
export default function HeroScene({ qr }) {
  return (
    <div
      className="pw-hero-art pw-local-hero"
      role="img"
      aria-label="Illustration of a café counter with a Praisly QR stand and an editable customer review draft"
    >
      <div className="local-backdrop" />
      <span className="local-eyebrow">GOOD EXPERIENCES START HERE.</span>
      <div className="local-shop-depth">
        <svg
          className="local-shop"
          viewBox="0 0 560 520"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="local-wall"
              x1="110"
              y1="80"
              x2="400"
              y2="380"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fef9e9" />
              <stop offset="1" stopColor="#e8dcc1" />
            </linearGradient>
            <linearGradient
              id="local-window"
              x1="170"
              y1="160"
              x2="290"
              y2="370"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#799084" />
              <stop offset="1" stopColor="#3f5b4d" />
            </linearGradient>
            <linearGradient
              id="local-wood"
              x1="110"
              y1="350"
              x2="400"
              y2="500"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ac6644" />
              <stop offset="1" stopColor="#754b35" />
            </linearGradient>
            <linearGradient
              id="local-counter"
              x1="100"
              y1="360"
              x2="375"
              y2="480"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#6a8170" />
              <stop offset="1" stopColor="#405a49" />
            </linearGradient>
            <filter
              id="local-shadow"
              x="-30%"
              y="-30%"
              width="160%"
              height="180%"
            >
              <feDropShadow
                dx="0"
                dy="15"
                stdDeviation="14"
                floodColor="#54422c"
                floodOpacity=".14"
              />
            </filter>
          </defs>
          <ellipse cx="291" cy="478" rx="218" ry="24" fill="#a192741b" />
          <g filter="url(#local-shadow)">
            <path d="m81 440 303-34 133 49-304 42Z" fill="#dfd5bf" />
            <path d="m81 440 132 49 304-34v11l-304 43-132-48Z" fill="#c5b99f" />
            <path d="M110 99 316 78l91 39v292l-209 28-88-44Z" fill="#c5b99d" />
            <path d="m110 99 206-21v309l-206 25Z" fill="url(#local-wall)" />
            <path d="m316 78 91 39v292l-91-22Z" fill="#d6c8ab" />
            <path d="m132 192 163-17v168l-163 19Z" fill="#314f40" />
            <path d="m143 202 142-15v145l-142 17Z" fill="url(#local-window)" />
            <path d="m158 203 54-6-68 112v-49Z" fill="#e6efcd" opacity=".12" />
            <path d="m238 193 37-4-91 153-34 4Z" fill="#e6efcd" opacity=".1" />
            <path
              d="m214 194 0 147M141 290l146-17"
              stroke="#c6c4a4"
              strokeWidth="5"
            />
            <path d="m335 174 50 21v118l-50-15Z" fill="#8c9b83" />
            <path d="m344 187 32 13v92l-32-9Z" fill="#526c56" />
            <path d="m113 131 200-21 85 33-199 25Z" fill="#e6b544" />
            <path d="m113 131-29 57 215-24 14-54Z" fill="#efe5c9" />
            <path d="m313 110 85 33 29 57-128-36Z" fill="#d29936" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={i}
                d={`m${113 + i * 34} ${131 - i * 3.5} 17-1.8 -${24 - i * 1.5} 55.5 -18 2Z`}
                fill="#637d63"
              />
            ))}
            <path d="m84 188 215-24v17L84 205Z" fill="#f0e4c5" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={i}
                d={`m${84 + i * 36} ${188 - i * 4} 18-2v17l-18 2Z`}
                fill="#637d63"
              />
            ))}
            <path d="m299 164 128 36v17l-128-36Z" fill="#b8852b" />
            <g transform="matrix(1 -.1 0 1 154 263)">
              <text className="local-shop-name" x="0" y="0">
                bloom.
              </text>
              <text className="local-shop-subtitle" x="6" y="21">
                COFFEE & GOOD COMPANY
              </text>
            </g>
            <path d="m101 352 223-24 135 45-227 34Z" fill="#deb982" />
            <path
              d="m101 352 131 44 227-23v15l-227 29-131-49Z"
              fill="#b88354"
            />
            <path d="m111 370 121 47v73l-121-48Z" fill="url(#local-wood)" />
            <path d="m232 417 216-28v75l-216 26Z" fill="url(#local-counter)" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <path
                key={i}
                d={`M${244 + i * 22} ${420 - i * 2.8}v62`}
                stroke="#bfc8a633"
                strokeWidth="2"
              />
            ))}
            <path
              d="M130 389v46m17-39v46m18-39v46m18-39v46m18-39v46"
              stroke="#492e2528"
              strokeWidth="2"
            />
          </g>
          <g className="local-coffee">
            <ellipse
              cx="202"
              cy="365"
              rx="37"
              ry="11"
              fill="#ad7b4a"
              opacity=".22"
            />
            <ellipse cx="197" cy="360" rx="33" ry="10" fill="#fff7df" />
            <path
              d="M215 334c25-5 28 21 4 21"
              stroke="#e9dab6"
              strokeWidth="8"
            />
            <path d="M174 330h45v19c0 23-45 23-45 0Z" fill="#fff9e9" />
            <ellipse cx="196.5" cy="331" rx="22.5" ry="8" fill="#dec99b" />
            <ellipse cx="196.5" cy="332" rx="18" ry="5.5" fill="#815735" />
            <path d="M187 332c6-6 14-5 17-1s-12 6-17 1" fill="#ead0a0" />
            <path
              className="local-steam local-steam-one"
              d="M189 315c-12-14 9-16 0-30"
              stroke="#a08b6666"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              className="local-steam local-steam-two"
              d="M204 309c-8-10 8-13 0-23"
              stroke="#a08b6644"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          <g>
            <path d="m449 407 24-1-4 45c-1 6-15 7-17 0Z" fill="#ae6c49" />
            <ellipse cx="461" cy="407" rx="13" ry="5" fill="#c78c60" />
            <path
              d="M462 411v-68m-1 43-16-21m17 7 19-25"
              stroke="#587044"
              strokeWidth="3"
            />
            <ellipse
              cx="451"
              cy="355"
              rx="9"
              ry="22"
              fill="#7d8f5c"
              transform="rotate(-34 451 355)"
            />
            <ellipse
              cx="477"
              cy="352"
              rx="8"
              ry="24"
              fill="#526d49"
              transform="rotate(29 477 352)"
            />
            <ellipse
              cx="462"
              cy="330"
              rx="7"
              ry="20"
              fill="#91a06c"
              transform="rotate(-8 462 330)"
            />
          </g>
        </svg>
        <div className="local-qr-stand">
          <span className="local-qr-brand">
            praisly<span>↗</span>
          </span>
          <strong>Enjoyed your visit?</strong>
          {qr}
          <span className="local-scan-line" />
          <small>A few words go a long way.</small>
        </div>
      </div>
      <svg
        className="local-connection"
        viewBox="0 0 560 570"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M380 367C515 353 514 193 454 167"
          stroke="#b6a172"
          strokeWidth="1.5"
          strokeDasharray="4 7"
        />
        <path
          className="local-travel"
          d="M380 367C515 353 514 193 454 167"
          stroke="#b57e14"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="12 450"
        />
      </svg>
      <div className="local-review">
        <div className="local-review-top">
          <span className="local-review-avatar">a.</span>
          <div>
            A little help with the words.<small>EXAMPLE CUSTOMER DRAFT</small>
          </div>
          <span className="local-edit-icon" aria-hidden="true">
            ↗
          </span>
        </div>
        <span className="local-review-stars" aria-label="5 out of 5 stars">
          ★★★★★
        </span>
        <p>
          “Great coffee.
          <br />
          Even better people.”
          <span className="local-caret" aria-hidden="true" />
        </p>
        <div className="local-review-footer">
          <span>Make it yours.</span>
          <span className="local-draft-chip">
            Editable draft <span aria-hidden="true">✎</span>
          </span>
        </div>
      </div>
      <div className="local-caption">
        <span className="local-caption-dot" /> From a good visit
        <br />
        <em>to a few good words.</em>
      </div>
      <div className="local-scene-footer">
        <span>YOUR COUNTER. THEIR WORDS.</span>
        <span>ILLUSTRATION · SAMPLE DATA</span>
      </div>
    </div>
  );
}
