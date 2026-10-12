import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard";
import Reviews from "../src/pages/Reviews";

vi.mock("../src/services/api", () => ({
  authService: {
    getBusiness: () => ({
      business_name: "Sample Coffee",
      business_type: "restaurant",
      city: "Bengaluru",
    }),
    setBusiness: vi.fn(),
  },
  default: {
    get: vi.fn(async (url) => {
      if (url.includes("/stats"))
        return {
          data: {
            total_reviews: 3,
            google_reviews_gained: 9,
            google_current_count: 100,
            google_baseline_count: 91,
            google_current_rating: 4.8,
            drafts_sent: 2,
            negative_saved: 1,
            rating_distribution: { 5: 2, 2: 1 },
            reviews_over_time: [],
          },
        };
      if (url.includes("/auth/me"))
        return { data: { business: { business_name: "Sample Coffee" } } };
      if (url.includes("/feedback-insights"))
        return {
          data: {
            total_blocked: 1,
            blocked_this_month: 1,
            current_rating: 4.8,
            themes: [
              {
                tag: "Waiting time",
                count: 1,
                trend: "stable",
                recent_feedback: [],
              },
            ],
          },
        };
      if (url.includes("/list"))
        return {
          data: {
            reviews: [
              {
                id: "r1",
                rating: 5,
                status: "posted",
                created_at: "2025-01-01",
                review_text: "Lovely visit.",
              },
            ],
            total: 3,
            pages: 1,
          },
        };
      if (url.includes("/notifications"))
        return { data: { notifications: [] } };
      if (url.includes("/competitor-growth")) return { data: { series: [] } };
      return { data: [] };
    }),
  },
}));
afterEach(cleanup);
describe("Product metric presentation", () => {
  it("shows useful private ratings instead of modeled revenue on the dashboard", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    await screen.findByText("Private ratings");
    expect(screen.queryByText("Estimated Revenue")).toBeNull();
    expect(screen.getByText("Review drafts")).toBeTruthy();
  });
  it("labels customer confirmation accurately instead of counting total Google growth as clicks", async () => {
    render(
      <MemoryRouter>
        <Reviews />
      </MemoryRouter>,
    );
    await screen.findByText("Customer confirmed");
    expect(screen.queryByText("Google review clicks")).toBeNull();
    expect(
      screen.getByText(/Not independently verified on Google/),
    ).toBeTruthy();
    expect(screen.queryByText("Estimated damage prevented")).toBeNull();
  });
  it("renders feedback insights without revenue or counterfactual rating promises", async () => {
    render(
      <MemoryRouter>
        <Reviews />
      </MemoryRouter>,
    );
    await screen.findByText("Customer confirmed");
    fireEvent.click(screen.getByRole("button", { name: /Insights/ }));
    await screen.findByText("Feedback themes");
    expect(screen.queryByText("Revenue Protected")).toBeNull();
    expect(screen.queryByText(/Without Praisly:/)).toBeNull();
    expect(screen.getByText("Waiting time")).toBeTruthy();
  });
});
