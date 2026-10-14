import "./ReviewWall.css";

const reviews = [
  {
    kind: "The coffee stop",
    place: "A neighbourhood café",
    mark: "01",
    title: "My new usual.",
    quote: "Came in for a quick coffee and ended up staying an hour. Good flat white, a quiet corner, and nobody rushing you out.",
    detail: "A little room to slow down.",
    icon: "coffee",
  },
  {
    kind: "The fresh start",
    place: "A local salon",
    mark: "02",
    title: "They actually listened.",
    quote: "I’m usually nervous trying a new salon. They asked what I wanted, checked the length with me, and got it just right. Walked out feeling like myself again.",
    detail: "The kind of care you remember.",
    icon: "spark",
  },
  {
    kind: "The first visit",
    place: "An independent studio",
    mark: "03",
    title: "Back next Saturday.",
    quote: "My first pottery class, and my bowl is definitely wonky. But the teacher was so patient and made the whole afternoon fun. Already booked another.",
    detail: "A good reason to come back.",
    icon: "bowl",
  },
];

function ReviewSketch({ kind }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {kind === "coffee" ? (
        <>
          <path d="M17 31h39v14c0 13-8 19-19 19S17 57 17 45V31ZM56 35h6c14 0 12 18-6 18M11 69c16 5 39 5 55-1M28 23c-9-8 10-8 2-18M42 23c-8-8 10-8 2-18" />
          <path d="M22 36c8 3 21 3 29 0" />
        </>
      ) : kind === "spark" ? (
        <>
          <path d="m40 8 6 23 23 9-23 7-6 25-7-25-23-7 23-9 7-23ZM66 8v13m-6-6h13M15 58v13m-6-6h13" />
          <path d="M55 63c4-2 7-5 10-9M19 25c-3 4-5 7-6 11" />
        </>
      ) : (
        <>
          <ellipse cx="39" cy="35" rx="28" ry="9" />
          <path d="M11 35c3 19 12 29 28 29s26-10 28-29M23 47c9 5 22 5 31 0M32 18c-7-7 9-8 3-14M48 20c-5-6 7-8 3-14M25 67h29" />
        </>
      )}
    </svg>
  );
}

export default function ReviewWall() {
  return (
    <section className="pw-review-wall" id="reviews" aria-labelledby="pw-reviews-title">
      <div className="pw-wrap">
        <div className="pw-section-top">
          <span className="pw-kicker">03 / WORDS WORTH SHARING</span>
          <span className="pw-tiny">LITTLE MOMENTS. SOMETHING TO SAY.</span>
        </div>
        <div className="pw-reviews-heading" data-reveal>
          <h2 id="pw-reviews-title">More than stars.<br /><em>Stories that stick.</em></h2>
          <p>The coffee. The care. The feeling.<br />Good reviews remember the little things.</p>
        </div>
        <p className="pw-reviews-disclosure">Illustrative reviews of local businesses — sample copy, not customer testimonials.</p>
        <div className="pw-review-grid">
          {reviews.map((review) => (
            <figure className={`pw-review-paper pw-review-paper-${review.icon}`} key={review.kind} data-reveal>
              <div className="pw-review-paper-top">
                <span>{review.kind}</span>
                <span className="pw-review-sample">Sample review</span>
              </div>
              <ReviewSketch kind={review.icon} />
              <span className="pw-review-rating" aria-label="Example rating: 5 out of 5 stars">★★★★★</span>
              <blockquote>
                <h3>{review.title}</h3>
                <p>“{review.quote}”</p>
              </blockquote>
              <figcaption>
                <span className="pw-review-place-mark" aria-hidden="true">{review.mark}</span>
                <span><strong>{review.place}</strong><small>{review.detail}</small></span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="pw-reviews-endnote">
          <span aria-hidden="true">↳</span>
          <p>A good experience is yours to create.<br /><em>The words belong to them.</em></p>
          <a href="#experience">See how it works <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}
