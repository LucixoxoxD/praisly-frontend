import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Icon from "../components/Icon";
import "./CustomerReview.css";

const RATINGS = ["Very poor", "Could be better", "Okay", "Good", "Excellent"];

function cooldownActive(id) {
  try {
    return (
      Date.now() - Number(localStorage.getItem(`praisly_done_${id}`) || 0) <
      86400000
    );
  } catch {
    return false;
  }
}
function rememberSubmission(id) {
  // Storage can be unavailable in private browsers. The server still enforces limits.
  try {
    localStorage.setItem(`praisly_done_${id}`, String(Date.now()));
  } catch {
    /* optional device hint */
  }
}
function safeGoogleLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function CustomerReviewView({ businessId, client = api }) {
  const [screen, setScreen] = useState("loading");
  const [business, setBusiness] = useState(null);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [draft, setDraft] = useState("");
  const [previousDraft, setPreviousDraft] = useState(null);
  const [reviewId, setReviewId] = useState(null);
  const [googleUrl, setGoogleUrl] = useState(null);
  const [googleClicked, setGoogleClicked] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const heading = useRef(null);
  const editor = useRef(null);
  const requestLock = useRef(false);
  const copySequence = useRef(0);

  useEffect(() => {
    let active = true;
    client
      .get(`/api/review/${businessId}`)
      .then(({ data }) => {
        if (!active) return;
        setBusiness(data);
        setGoogleUrl(safeGoogleLink(data.google_review_url));
        setScreen(cooldownActive(businessId) ? "already_done" : "rate");
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.status === 404
            ? "This review link is no longer available. Please ask the business for a new one."
            : "We could not connect right now. Please check your connection and try again.",
        );
        setScreen("load_error");
      });
    return () => {
      active = false;
    };
  }, [businessId, client, loadAttempt]);

  useEffect(() => {
    document.title = business?.business_name
      ? `Review ${business.business_name} · Praisly`
      : "Share your experience · Praisly";
  }, [business]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [screen]);

  async function run(action, task) {
    if (requestLock.current) return;
    requestLock.current = true;
    setBusy(action);
    setError("");
    try {
      await task();
    } finally {
      requestLock.current = false;
      setBusy(null);
    }
  }

  function changeDraft(value) {
    copySequence.current += 1;
    setDraft(value);
    setCopyStatus("");
  }

  async function submitRating() {
    if (!rating) return;
    await run("submit", async () => {
      try {
        const { data } = await client.post(`/api/review/${businessId}/submit`, {
          rating,
          selected_tags: rating >= 4 ? selectedTags : [],
          custom_tag: null,
          customer_phone: "",
        });
        if (!data.review_id) throw new Error("Missing review receipt");
        setReviewId(data.review_id);
        rememberSubmission(businessId);
        if (rating >= 4) {
          setDraft(data.draft || "");
          setFallback(Boolean(data.is_fallback));
          if (data.google_review_url)
            setGoogleUrl(safeGoogleLink(data.google_review_url));
          setScreen("draft");
        } else setScreen("feedback");
      } catch (err) {
        if (err.response?.status === 429) setScreen("already_done");
        else if (
          err.response?.status === 403 &&
          err.response?.data?.detail?.code === "trial_expired"
        )
          setScreen("paused");
        else setError("Your rating could not be saved. Please try again.");
      }
    });
  }

  async function regenerate() {
    await run("regenerate", async () => {
      try {
        const { data } = await client.post(
          `/api/review/${businessId}/regenerate`,
          {
            review_id: reviewId,
            rating,
            selected_tags: selectedTags,
            previous_draft: draft,
          },
        );
        if (data.regenerated === false || !data.draft?.trim())
          throw new Error("No replacement");
        setPreviousDraft(draft);
        changeDraft(data.draft);
      } catch {
        setError(
          "A new draft is unavailable. Your current words are safe—you can edit them below.",
        );
      }
    });
  }

  async function copyDraft() {
    if (!draft.trim()) return;
    const sequence = ++copySequence.current;
    setCopyStatus("copying");
    try {
      await navigator.clipboard.writeText(draft.trim());
      if (sequence === copySequence.current) setCopyStatus("copied");
    } catch {
      if (sequence !== copySequence.current) return;
      setCopyStatus("failed");
      editor.current?.focus();
      editor.current?.select();
    }
  }

  async function saveFeedback() {
    await run("feedback", async () => {
      try {
        if (!reviewId) throw new Error("Missing review receipt");
        await client.post(`/api/review/${businessId}/private-feedback`, {
          review_id: reviewId,
          feedback_text: feedback.trim() || "(no details shared)",
        });
        setScreen("feedback_done");
      } catch {
        setError(
          "Your feedback was not sent. Your message is still here—please try again.",
        );
      }
    });
  }

  async function confirmPosted() {
    await run("confirm", async () => {
      try {
        if (!reviewId) throw new Error("Missing review receipt");
        await client.post(`/api/review/${businessId}/confirm-posted`, {
          review_id: reviewId,
        });
        setScreen("posted_done");
      } catch {
        setError(
          "We could not save your confirmation. Your Google review is unaffected. Please try again.",
        );
      }
    });
  }

  const name = business?.business_name || "this business";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  const finished = [
    "feedback_done",
    "posted_done",
    "skipped",
    "already_done",
    "paused",
    "load_error",
  ].includes(screen);
  const endings = {
    feedback_done: [
      "Your voice matters.",
      "Your feedback has been shared privately with the business. Thank you for taking the time.",
    ],
    posted_done: [
      "Thanks for sharing.",
      "Your confirmation has been saved. Thank you for sharing your experience on Google.",
    ],
    skipped: [
      "Thanks for stopping by.",
      "You can close this page whenever you are ready.",
    ],
    already_done: [
      "Thanks for your time.",
      "A rating has already been submitted from this device or connection recently.",
    ],
    paused: [
      "Reviews are paused.",
      "This business is not currently accepting new reviews. Please try again later.",
    ],
    load_error: ["Let’s try that again.", error],
  };

  return (
    <main className="cr-page">
      <div className="cr-brand" aria-label="Praisly">
        <span>P</span>praisly<span className="cr-brand-dot">.</span>
      </div>
      <div className="cr-layout">
        <aside className="cr-intro" aria-label="About this review">
          <span className="ui-eyebrow">
            SMALL MOMENTS. LASTING IMPRESSIONS.
          </span>
          <h1>
            A little feedback.
            <br />
            <em>A real difference.</em>
          </h1>
          <p>
            A warm welcome. A thoughtful detail.
            <br />A moment worth sharing. Tell it your way.
          </p>
          <div className="cr-art" aria-hidden="true">
            <span className="cr-art-orbit" />
            <span className="cr-art-star">✳</span>
            <div className="cr-art-note">
              <Icon name="quote" size={24} />
              <span>
                Good words
                <br />
                <b>start with you.</b>
              </span>
            </div>
          </div>
          <span className="cr-intro-foot">
            <Icon name="shield" size={16} /> Your experience. Your words.
          </span>
        </aside>
        <section
          className="cr-panel"
          aria-label="Share your experience"
          aria-busy={Boolean(busy) || screen === "loading"}
        >
          {business && (
            <div className="cr-business">
              <span className="cr-business-mark">{initials}</span>
              <div>
                <span>YOUR VISIT TO</span>
                <strong>{name}</strong>
              </div>
              <Icon name="star" size={20} />
            </div>
          )}
          {screen === "loading" ? (
            <div className="cr-state" role="status">
              <span className="cr-spinner" />
              Getting your review ready…
            </div>
          ) : finished ? (
            <div className="cr-state">
              <div className="cr-state-icon">
                <Icon
                  name={
                    screen === "load_error"
                      ? "refresh"
                      : screen === "paused"
                        ? "shield"
                        : "check"
                  }
                  size={30}
                />
              </div>
              <h2 ref={heading} tabIndex={-1}>
                {endings[screen][0]}
              </h2>
              <p>{endings[screen][1]}</p>
              {screen === "load_error" && (
                <button
                  className="ui-button"
                  onClick={() => {
                    setScreen("loading");
                    setError("");
                    setLoadAttempt((n) => n + 1);
                  }}
                >
                  Try again <Icon name="refresh" />
                </button>
              )}
              {screen !== "load_error" && (
                <span className="cr-fine">You can close this tab now.</span>
              )}
            </div>
          ) : (
            <>
              <div className="cr-progress">
                <span className={screen === "rate" ? "active" : "complete"}>
                  01 <b>Your experience</b>
                </span>
                <i />
                <span className={screen !== "rate" ? "active" : ""}>
                  02{" "}
                  <b>
                    {rating > 0 && rating < 4
                      ? "Private feedback"
                      : "Your words"}
                  </b>
                </span>
              </div>
              {screen === "rate" && (
                <>
                  <span className="ui-eyebrow">EVERY EXPERIENCE COUNTS</span>
                  <h2 ref={heading} tabIndex={-1}>
                    How was your visit?
                  </h2>
                  <p className="cr-description">
                    Take a moment to tell us how it felt.
                  </p>
                  <div
                    className="cr-stars"
                    role="group"
                    aria-label="Rate your visit"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={star <= rating ? "selected" : ""}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        aria-pressed={rating === star}
                        onClick={() => setRating(star)}
                        disabled={Boolean(busy)}
                      >
                        <Icon name="star" size={32} />
                      </button>
                    ))}
                  </div>
                  <p className="cr-rating-label" role="status">
                    {rating
                      ? RATINGS[rating - 1]
                      : "Choose a rating from 1 to 5"}
                  </p>
                  {rating >= 4 && business.quick_tags?.length > 0 && (
                    <fieldset className="cr-tags">
                      <legend>
                        What stood out? <span>Optional</span>
                      </legend>
                      <div>
                        {business.quick_tags.map((tag) => (
                          <button
                            key={tag.label}
                            className="ui-chip"
                            aria-pressed={selectedTags.includes(tag.label)}
                            disabled={Boolean(busy)}
                            onClick={() =>
                              setSelectedTags((tags) =>
                                tags.includes(tag.label)
                                  ? tags.filter((t) => t !== tag.label)
                                  : [...tags, tag.label],
                              )
                            }
                          >
                            {selectedTags.includes(tag.label) && (
                              <Icon name="check" size={14} />
                            )}
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}
                  {error && (
                    <p className="ui-message ui-message-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    className="ui-button cr-primary"
                    disabled={!rating || Boolean(busy)}
                    onClick={submitRating}
                  >
                    {busy
                      ? "Saving your rating…"
                      : rating >= 4
                        ? "Continue to your review"
                        : "Continue"}
                    <Icon name="arrow" />
                  </button>
                  <button
                    className="ui-button ui-button-quiet"
                    disabled={Boolean(busy)}
                    onClick={() => setScreen("skipped")}
                  >
                    Maybe later
                  </button>
                </>
              )}
              {screen === "draft" && (
                <>
                  <span className="ui-eyebrow">
                    A STARTING POINT, IN YOUR HANDS
                  </span>
                  <h2 ref={heading} tabIndex={-1}>
                    Make it yours.
                  </h2>
                  <p className="cr-description">
                    Edit anything below so it reflects your visit. You choose
                    what to share.
                  </p>
                  {fallback && (
                    <p className="ui-message">
                      This is a starter draft. Please add your own experience
                      before sharing.
                    </p>
                  )}
                  <div className="cr-editor">
                    <div>
                      <label htmlFor="customer-draft">Your review</label>
                      <button
                        className="cr-edit"
                        onClick={() => editor.current?.focus()}
                        disabled={Boolean(busy)}
                      >
                        <Icon name="edit" size={14} /> Edit review
                      </button>
                    </div>
                    <textarea
                      id="customer-draft"
                      ref={editor}
                      value={draft}
                      disabled={Boolean(busy)}
                      onChange={(event) => changeDraft(event.target.value)}
                      rows={6}
                      placeholder="Write about your experience…"
                    />
                    <span>{draft.length} characters · editable</span>
                  </div>
                  <div className="cr-draft-tools">
                    <button
                      className="cr-tool"
                      disabled={Boolean(busy)}
                      onClick={regenerate}
                    >
                      <Icon name="refresh" size={15} />
                      {busy === "regenerate"
                        ? "Trying a new version…"
                        : "Try another version"}
                    </button>
                    {previousDraft !== null && (
                      <button
                        className="cr-tool"
                        disabled={Boolean(busy)}
                        onClick={() => {
                          changeDraft(previousDraft);
                          setPreviousDraft(null);
                        }}
                      >
                        Undo replacement
                      </button>
                    )}
                  </div>
                  {error && (
                    <p className="ui-message ui-message-error" role="alert">
                      {error}
                    </p>
                  )}
                  <p className="cr-copy-status" role="status">
                    {copyStatus === "copied"
                      ? "Copied. Now open Google and paste your words."
                      : copyStatus === "failed"
                        ? "Copy was blocked. Your text is selected—copy it manually before opening Google."
                        : "1. Copy your words. 2. Open Google, paste and post."}
                  </p>
                  <div className="cr-share-actions">
                    <button
                      className="ui-button"
                      disabled={
                        !draft.trim() ||
                        Boolean(busy) ||
                        copyStatus === "copying"
                      }
                      onClick={copyDraft}
                    >
                      <Icon name={copyStatus === "copied" ? "check" : "copy"} />
                      {copyStatus === "copying"
                        ? "Copying…"
                        : copyStatus === "copied"
                          ? "Copied"
                          : "Copy review"}
                    </button>
                    {googleUrl ? (
                      <a
                        className="ui-button ui-button-secondary"
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setGoogleClicked(true)}
                      >
                        Open Google <Icon name="external" />
                      </a>
                    ) : (
                      <p className="cr-fine">
                        The Google link is unavailable. You can still copy your
                        review and find the business on Google.
                      </p>
                    )}
                  </div>
                  {googleClicked && (
                    <div className="cr-confirm">
                      <p>Posted your review on Google?</p>
                      <button
                        className="ui-button ui-button-secondary"
                        disabled={Boolean(busy)}
                        onClick={confirmPosted}
                      >
                        {busy === "confirm"
                          ? "Saving confirmation…"
                          : "Yes, I posted it"}
                        <Icon name="check" />
                      </button>
                      <span className="cr-fine">
                        This records your confirmation; Praisly does not post
                        for you.
                      </span>
                    </div>
                  )}
                </>
              )}
              {screen === "feedback" && (
                <>
                  <span className="ui-eyebrow">
                    A CHANCE TO MAKE THINGS BETTER
                  </span>
                  <h2 ref={heading} tabIndex={-1}>
                    We’re listening.
                  </h2>
                  <p className="cr-description">
                    Tell {name} what could have been better. Your message goes
                    privately to the business.
                  </p>
                  <div className="cr-editor">
                    <label htmlFor="customer-feedback">
                      What happened? <span>Optional</span>
                    </label>
                    <textarea
                      id="customer-feedback"
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      disabled={Boolean(busy)}
                      rows={6}
                      placeholder="Tell us a little about your visit…"
                    />
                  </div>
                  {error && (
                    <p className="ui-message ui-message-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    className="ui-button cr-primary"
                    disabled={Boolean(busy)}
                    onClick={saveFeedback}
                  >
                    {busy ? "Sending feedback…" : "Send private feedback"}
                    <Icon name="arrow" />
                  </button>
                  <button
                    className="ui-button ui-button-quiet"
                    disabled={Boolean(busy)}
                    onClick={() => setScreen("skipped")}
                  >
                    Skip the message
                  </button>
                </>
              )}
            </>
          )}
          <footer className="cr-powered">
            <Icon name="shield" size={14} /> Thoughtfully collected with{" "}
            <b>Praisly</b>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default function CustomerReview() {
  const { businessId } = useParams();
  return <CustomerReviewView key={businessId} businessId={businessId} />;
}
