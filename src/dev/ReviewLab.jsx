import { useMemo, useState, useRef, useEffect } from "react";
import { CustomerReviewView } from "../pages/CustomerReview";

// Development-only visual fixture. This module is excluded from production routes.
export default function ReviewLab() {
  const [scenario, setScenario] = useState("normal");
  const [version, setVersion] = useState(0);
  const [fail, setFail] = useState(false);
  const failure = useRef(fail);
  useEffect(() => {
    failure.current = fail;
  }, [fail]);
  const client = useMemo(
    () => ({
      get: async () => ({
        data: {
          business_name:
            scenario === "long-name"
              ? "The Neighbourhood Coffee House & Community Kitchen"
              : "Bloom Coffee",
          quick_tags: [
            { label: "Warm welcome" },
            { label: "Great coffee" },
            { label: "Lovely atmosphere" },
          ],
          google_review_url: null,
        },
      }),
      post: async (url) => {
        if (url.endsWith("/submit"))
          return {
            data: {
              review_id: "local-fixture",
              draft:
                scenario === "empty"
                  ? ""
                  : "A lovely little spot for coffee. The team made me feel welcome, and I really enjoyed the relaxed atmosphere. I’d happily visit again.",
            },
          };
        if (failure.current) throw new Error("Simulated offline request");
        return {
          data: {
            draft:
              "Such a welcoming place. I enjoyed my coffee and the friendly service.",
            regenerated: true,
          },
        };
      },
    }),
    [scenario],
  );
  const businessId = `local-review-lab-${version}`;
  return (
    <>
      <div
        style={{
          padding: "12px 18px",
          background: "#1a1610",
          color: "white",
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          fontSize: 12,
        }}
      >
        <b>LOCAL TEST · SAMPLE DATA</b>
        <label>
          Scenario{" "}
          <select
            value={scenario}
            onChange={(e) => {
              setScenario(e.target.value);
              setVersion((n) => n + 1);
            }}
          >
            <option value="normal">Normal</option>
            <option value="long-name">Long business name</option>
            <option value="empty">Empty draft</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={fail}
            onChange={(e) => setFail(e.target.checked)}
          />{" "}
          Fail follow-up requests
        </label>
        <button
          onClick={() => {
            localStorage.removeItem(`praisly_done_${businessId}`);
            setVersion((n) => n + 1);
          }}
        >
          Restart flow
        </button>
      </div>
      <CustomerReviewView
        key={businessId}
        businessId={businessId}
        client={client}
      />
    </>
  );
}
