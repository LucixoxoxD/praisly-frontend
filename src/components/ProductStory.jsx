import { useState } from "react";
import Icon from "./Icon";
import "./ProductStory.css";

const stages = [
  ["A small invitation.", "Place your QR where the experience happens."],
  [
    "Their experience. Their words.",
    "Customers rate their visit and shape their own review.",
  ],
  ["A clearer picture.", "See review activity and private feedback together."],
];
export default function ProductStory() {
  const [stage, setStage] = useState(0);
  return (
    <div className="ps-story" aria-label="Illustrated Praisly product journey">
      <div className="ps-story-meta">
        <span>THE PRAISLY EFFECT</span>
        <span>01—03</span>
      </div>
      <div className={`ps-scene ps-stage-${stage}`}>
        <div className="ps-orbit" aria-hidden="true" />
        <div className="ps-orbit ps-orbit-inner" aria-hidden="true" />
        <span className="ps-spark" aria-hidden="true">
          ✳
        </span>
        <div className="ps-invitation">
          <span>
            A LITTLE FEEDBACK
            <br />
            GOES A LONG WAY.
          </span>
          <div className="ps-qr" aria-hidden="true">
            <Icon name="qr" size={86} />
          </div>
          <strong>Your neighbourhood café</strong>
          <span>QR illustration · sample business</span>
        </div>
        <div className="ps-review">
          <span>
            <Icon name="star" size={13} /> A MOMENT, IN WORDS
          </span>
          <p>
            “A warm welcome.
            <br />
            <em>A lovely little place.”</em>
          </p>
          <div>
            <i>★★★★★</i>
            <span>Illustrative review</span>
          </div>
        </div>
        <div className="ps-dashboard">
          <div>
            <span>
              <Icon name="chart" size={15} /> Your overview
            </span>
            <span>SAMPLE</span>
          </div>
          <div className="ps-dashboard-stats">
            <span>
              <b>
                4.8<small>/5</small>
              </b>
              Customer rating
            </span>
            <span>
              <b>24</b>Review drafts
            </span>
          </div>
          <div className="ps-bars" aria-hidden="true">
            {[25, 42, 36, 57, 50, 73, 68, 88, 79, 96].map((height, i) => (
              <i key={i} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="ps-story-caption" aria-live="polite">
        <strong>{stages[stage][0]}</strong>
        <p>{stages[stage][1]}</p>
      </div>
      <div
        className="ps-story-tabs"
        role="group"
        aria-label="Explore the product journey"
      >
        {["Invite", "Review", "Understand"].map((label, i) => (
          <button
            key={label}
            aria-pressed={stage === i}
            onClick={() => setStage(i)}
          >
            <span>0{i + 1}</span>
            {label}
            <Icon name="arrow" size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
