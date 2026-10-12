import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CustomerReviewView } from "../src/pages/CustomerReview";

afterEach(cleanup);
beforeEach(() => localStorage.clear());
const business = {
  business_name: "Neighbourhood Coffee",
  quick_tags: [{ label: "Friendly team" }],
  google_review_url:
    "https://search.google.com/local/writereview?placeid=sample",
};
function setup({
  submit = {},
  fail = "",
  clipboardFails = false,
  missingLink = false,
} = {}) {
  const copy = vi
    .fn()
    .mockImplementation(() =>
      clipboardFails ? Promise.reject(new Error("denied")) : Promise.resolve(),
    );
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: copy },
  });
  let failing = fail;
  const client = {
    get: vi
      .fn()
      .mockResolvedValue({
        data: {
          ...business,
          google_review_url: missingLink ? null : business.google_review_url,
        },
      }),
    post: vi.fn().mockImplementation((url) => {
      if (failing && url.endsWith(failing))
        return Promise.reject(new Error("offline"));
      if (url.endsWith("/submit"))
        return Promise.resolve({
          data: { review_id: "review-1", draft: "A lovely visit.", ...submit },
        });
      if (url.endsWith("/regenerate"))
        return Promise.resolve({
          data: { draft: "A different draft.", regenerated: true },
        });
      return Promise.resolve({ data: { message: "saved" } });
    }),
  };
  render(<CustomerReviewView businessId="test-business" client={client} />);
  return {
    client,
    copy,
    recover: () => {
      failing = "";
    },
  };
}
async function rate(value) {
  await screen.findByRole("heading", { name: "How was your visit?" });
  fireEvent.click(
    screen.getByRole("button", {
      name: `${value} star${value > 1 ? "s" : ""}`,
      exact: true,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: value >= 4 ? /Continue to your review/ : "Continue",
      exact: value < 4,
    }),
  );
}

describe("Customer review reliability", () => {
  it("copies the customer-edited text and clears stale success when edited again", async () => {
    const { copy } = setup();
    await rate(5);
    const draft = await screen.findByLabelText("Your review");
    fireEvent.change(draft, { target: { value: "My own honest words." } });
    fireEvent.click(screen.getByRole("button", { name: "Copy review" }));
    await screen.findByRole("button", { name: "Copied", exact: true });
    expect(copy).toHaveBeenCalledWith("My own honest words.");
    fireEvent.change(draft, { target: { value: "Changed again." } });
    expect(
      screen.queryByRole("button", { name: "Copied", exact: true }),
    ).toBeNull();
  });
  it("does not claim success when clipboard permission is denied", async () => {
    setup({ clipboardFails: true });
    await rate(4);
    await screen.findByLabelText("Your review");
    fireEvent.click(screen.getByRole("button", { name: "Copy review" }));
    await screen.findByText(/Copy was blocked/);
    expect(
      screen.queryByRole("button", { name: "Copied", exact: true }),
    ).toBeNull();
    expect(screen.getByLabelText("Your review").selectionStart).toBe(0);
  });
  it("retains feedback after failure and permits a successful retry", async () => {
    const { client, recover } = setup({ fail: "/private-feedback" });
    await rate(2);
    const feedback = await screen.findByLabelText(/What happened/);
    fireEvent.change(feedback, {
      target: { value: "My appointment started late." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Send private feedback/ }),
    );
    await screen.findByRole("alert");
    expect(feedback.value).toBe("My appointment started late.");
    expect(screen.queryByText("Your voice matters.")).toBeNull();
    recover();
    fireEvent.click(
      screen.getByRole("button", { name: /Send private feedback/ }),
    );
    await screen.findByText("Your voice matters.");
    expect(client.post).toHaveBeenLastCalledWith(
      "/api/review/test-business/private-feedback",
      { review_id: "review-1", feedback_text: "My appointment started late." },
    );
  });
  it("does not show completion if posting confirmation fails", async () => {
    setup({ fail: "/confirm-posted" });
    await rate(5);
    const google = await screen.findByRole("link", { name: /Open Google/ });
    // Prevent external navigation while exercising the confirmation state.
    google.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(google);
    fireEvent.click(screen.getByRole("button", { name: /Yes, I posted it/ }));
    await screen.findByText(/could not save your confirmation/);
    expect(screen.queryByText("Thanks for sharing.")).toBeNull();
  });
  it("keeps the intended rating split and does not claim feedback was sent on skip", async () => {
    setup();
    await rate(3);
    await screen.findByRole("heading", { name: "We’re listening." });
    expect(screen.queryByRole("link", { name: /Open Google/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Skip the message" }));
    await screen.findByText("Thanks for stopping by.");
    expect(screen.queryByText(/has been shared privately/)).toBeNull();
  });
  it("accepts writing from scratch when generation returns an empty draft", async () => {
    setup({ submit: { draft: "" } });
    await rate(5);
    const draft = await screen.findByLabelText("Your review");
    expect(screen.getByRole("button", { name: "Copy review" }).disabled).toBe(
      true,
    );
    fireEvent.change(draft, { target: { value: "My experience." } });
    expect(screen.getByRole("button", { name: "Copy review" }).disabled).toBe(
      false,
    );
  });
  it("does not offer an unavailable Google link", async () => {
    setup({ missingLink: true });
    await rate(5);
    await screen.findByLabelText("Your review");
    expect(screen.queryByRole("link", { name: /Open Google/ })).toBeNull();
    expect(screen.getByText(/Google link is unavailable/)).toBeTruthy();
  });
  it("lets customers undo regeneration without losing their edits", async () => {
    setup();
    await rate(5);
    const draft = await screen.findByLabelText("Your review");
    fireEvent.change(draft, { target: { value: "My edited original." } });
    fireEvent.click(
      screen.getByRole("button", { name: "Try another version" }),
    );
    await waitFor(() => expect(draft.value).toBe("A different draft."));
    fireEvent.click(screen.getByRole("button", { name: "Undo replacement" }));
    expect(draft.value).toBe("My edited original.");
  });
  it("still completes submission when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    setup();
    await rate(5);
    await screen.findByRole("heading", { name: "Make it yours." });
  });
});
