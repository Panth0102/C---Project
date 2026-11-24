/**
 * Tests for Screen 3 — CustomerStatusPage /status/:token
 *
 * queueService is mocked so no network calls are made.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerStatusPage } from "@/pages/CustomerStatusPage";
import type { QueueEntry } from "@/types/queue";

// ── Mock queueService ─────────────────────────────────────────────────────────
vi.mock("@/services/queueService", () => ({
  queueService: {
    getStatusByToken: vi.fn(),
    cancelMySpot:     vi.fn(),
  },
}));

import { queueService } from "@/services/queueService";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const baseEntry = (overrides: Partial<QueueEntry> = {}): QueueEntry => ({
  id: 1,
  token: "240115-001",
  customer_name: "Arjun Sharma",
  phone: "9876543210",
  status: "waiting",
  position: 3,
  estimated_wait_minutes: 25,
  total_price: 250,
  total_duration: 30,
  barber_locked: false,
  called_at: null,
  started_at: null,
  completed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  barber: { id: 1, name: "Rajan Mehta", specialty: "Classic Cuts", status: "available", is_active: true, initials: "RM" },
  services: [{ id: 1, name: "Classic Haircut", price: 250, duration: 30, description: null, icon: null, is_active: true }],
  ...overrides,
});

function renderPage(token = "240115-001") {
  return render(
    <MemoryRouter initialEntries={[`/status/${token}`]}>
      <Routes>
        <Route path="/status/:token" element={<CustomerStatusPage />} />
        <Route path="/join" element={<div>Join Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CustomerStatusPage — waiting state", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockResolvedValue(baseEntry());
  });
  afterEach(() => vi.clearAllMocks());

  it("renders the token as the visual centrepiece", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("240115-001")).toBeInTheDocument());
  });

  it("shows Waiting badge", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/^Waiting$/i)).toBeInTheDocument());
  });

  it("shows queue position", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/#3/i)).toBeInTheDocument());
  });

  it("shows estimated wait time", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/25 min/i)).toBeInTheDocument());
  });

  it("shows customer name in booking details", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Arjun Sharma")).toBeInTheDocument());
  });

  it("shows barber name in booking details", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Rajan Mehta")).toBeInTheDocument());
  });

  it("shows selected service", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/Classic Haircut/i)).toBeInTheDocument());
  });

  it("shows total price", async () => {
    renderPage();
    // ₹250 appears in both the service row and the totals row — just confirm presence
    await waitFor(() => {
      const prices = screen.getAllByText("₹250");
      expect(prices.length).toBeGreaterThan(0);
    });
  });

  it("shows Cancel My Spot button for waiting entries", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Cancel My Spot/i })).toBeInTheDocument()
    );
  });

  it("shows Refresh Status button", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Refresh Status/i })).toBeInTheDocument()
    );
  });
});

describe("CustomerStatusPage — approaching turn (position 2)", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockResolvedValue(baseEntry({ position: 2 }));
  });
  afterEach(() => vi.clearAllMocks());

  it("shows 'Almost Your Turn' badge", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Almost Your Turn/i)).toBeInTheDocument()
    );
  });

  it("shows the head-to-shop reminder", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Head to the shop now/i)).toBeInTheDocument()
    );
  });
});

describe("CustomerStatusPage — called state (full-screen)", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockResolvedValue(
      baseEntry({ status: "called", position: 0 })
    );
  });
  afterEach(() => vi.clearAllMocks());

  it("renders IT'S YOUR TURN heading", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/It's Your/i)).toBeInTheDocument()
    );
  });

  it("shows the barber's name in the callout", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Rajan Mehta/i)).toBeInTheDocument()
    );
  });

  it("shows the token in the callout", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("240115-001")).toBeInTheDocument()
    );
  });
});

describe("CustomerStatusPage — in_service state", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockResolvedValue(
      baseEntry({ status: "in_service", position: 0, started_at: new Date().toISOString() })
    );
  });
  afterEach(() => vi.clearAllMocks());

  it("shows In the Chair badge", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/In the Chair/i)).toBeInTheDocument());
  });

  it("does NOT show cancel button while in service", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Cancel My Spot/i })).not.toBeInTheDocument();
    });
  });
});

describe("CustomerStatusPage — completed state", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockResolvedValue(
      baseEntry({ status: "completed", position: null })
    );
  });
  afterEach(() => vi.clearAllMocks());

  it("shows completion message", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Thank You for Visiting/i)).toBeInTheDocument()
    );
  });

  it("shows Join Again link for terminal states", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Join Again/i })).toBeInTheDocument()
    );
  });
});

describe("CustomerStatusPage — cancelled state", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockResolvedValue(
      baseEntry({ status: "cancelled", position: null })
    );
  });
  afterEach(() => vi.clearAllMocks());

  it("shows cancellation message", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Queue Spot Cancelled/i)).toBeInTheDocument()
    );
  });
});

describe("CustomerStatusPage — no_show state", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockResolvedValue(
      baseEntry({ status: "no_show", position: null })
    );
  });
  afterEach(() => vi.clearAllMocks());

  it("shows no-show message", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Marked as No-Show/i)).toBeInTheDocument()
    );
  });
});

describe("CustomerStatusPage — 404 / error", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockRejectedValue(
      Object.assign(new Error("Not found"), {
        response: { status: 404, data: { detail: "Token not found." } },
        isAxiosError: true,
      })
    );
  });
  afterEach(() => vi.clearAllMocks());

  it("shows Token Not Found heading", async () => {
    renderPage("INVALID-999");
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /Token Not Found/i })).toBeInTheDocument()
    );
  });

  it("shows a Join the Queue link", async () => {
    renderPage("INVALID-999");
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Join the Queue/i })).toBeInTheDocument()
    );
  });
});

describe("CustomerStatusPage — cancel flow", () => {
  beforeEach(() => {
    vi.mocked(queueService.getStatusByToken).mockResolvedValue(baseEntry());
    vi.mocked(queueService.cancelMySpot).mockResolvedValue(
      baseEntry({ status: "cancelled", position: null })
    );
  });
  afterEach(() => vi.clearAllMocks());

  it("opens cancel confirmation modal", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Cancel My Spot/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Cancel My Spot/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Cancel Your Spot/i })).toBeInTheDocument();
  });

  it("closes modal when Keep My Spot is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Cancel My Spot/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Cancel My Spot/i }));
    await userEvent.click(screen.getByRole("button", { name: /Keep My Spot/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls cancelMySpot and shows cancelled state", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Cancel My Spot/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Cancel My Spot/i }));
    await userEvent.click(screen.getByRole("button", { name: /Yes, Cancel/i }));
    expect(queueService.cancelMySpot).toHaveBeenCalledWith(1);
    await waitFor(() =>
      expect(screen.getByText(/Queue Spot Cancelled/i)).toBeInTheDocument()
    );
  });
});
