/**
 * Tests for Screen 4 — ReceptionPage /reception
 *
 * queueService is mocked so no network calls are made.
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReceptionPage } from "@/pages/ReceptionPage";
import type { QueueEntry } from "@/types/queue";
import type { ApiBarber, ApiService, DashboardSummary } from "@/types/api";

// ── Mock ──────────────────────────────────────────────────────────────────────
vi.mock("@/services/queueService", () => ({
  queueService: {
    getActiveQueue:       vi.fn(),
    getBarbers:           vi.fn(),
    getServices:          vi.fn(),
    getDashboardSummary:  vi.fn(),
    updateStatus:         vi.fn(),
    updateBarberStatus:   vi.fn(),
    addWalkIn:            vi.fn(),
  },
}));

import { queueService } from "@/services/queueService";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockBarbers: ApiBarber[] = [
  { id: 1, name: "Rajan Mehta", specialty: "Classic Cuts", status: "available", is_active: true, initials: "RM" },
  { id: 2, name: "Arjun Shah",  specialty: "Modern Fades", status: "available", is_active: true, initials: "AS" },
  { id: 3, name: "Dev Patel",   specialty: "Beard",        status: "on_break",  is_active: true, initials: "DP" },
];

const mockServices: ApiService[] = [
  { id: 1, name: "Classic Haircut", price: 250, duration: 30, description: null, icon: null, is_active: true },
  { id: 2, name: "Royal Shave",     price: 350, duration: 45, description: null, icon: null, is_active: true },
];

const mockSummary: DashboardSummary = {
  total_waiting: 2, total_in_service: 1, total_called: 0,
  average_wait_minutes: 20, queue_open: true,
};

const makeEntry = (overrides: Partial<QueueEntry> = {}): QueueEntry => ({
  id: 1,
  token: "240115-001",
  customer_name: "Test Customer",
  phone: "9876543210",
  status: "waiting",
  position: 1,
  estimated_wait_minutes: 20,
  total_price: 250,
  total_duration: 30,
  barber_locked: false,
  called_at: null,
  started_at: null,
  completed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  barber: null,
  services: [mockServices[0]],
  ...overrides,
});

function setup(queue: QueueEntry[] = []) {
  vi.mocked(queueService.getActiveQueue).mockResolvedValue(queue);
  vi.mocked(queueService.getBarbers).mockResolvedValue(mockBarbers);
  vi.mocked(queueService.getServices).mockResolvedValue(mockServices);
  vi.mocked(queueService.getDashboardSummary).mockResolvedValue(mockSummary);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ReceptionPage />
    </MemoryRouter>
  );
}

describe("ReceptionPage — layout", () => {
  beforeEach(() => setup());
  afterEach(() => vi.clearAllMocks());

  it("renders the Reception title in the top bar", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/Reception/i)).toBeInTheDocument());
  });

  it("shows queue open/closed status badge", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText(/Open/i)).toBeInTheDocument());
  });

  it("renders all barber station cards", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Rajan Mehta")).toBeInTheDocument();
      expect(screen.getByText("Arjun Shah")).toBeInTheDocument();
      expect(screen.getByText("Dev Patel")).toBeInTheDocument();
    });
  });

  it("shows waiting count from summary", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
  });

  it("renders Add Walk-In button", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Walk-In/i })).toBeInTheDocument()
    );
  });
});

describe("ReceptionPage — queue table", () => {
  beforeEach(() => setup([makeEntry()]));
  afterEach(() => vi.clearAllMocks());

  it("shows the queue token in the table", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("240115-001")).toBeInTheDocument());
  });

  it("shows the customer name", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText("Test Customer")).toBeInTheDocument());
  });

  it("shows Waiting status badge", async () => {
    renderPage();
    await waitFor(() => {
      const badges = screen.getAllByText(/Waiting/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it("shows Call action button for waiting entries", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Call 240115-001/i })).toBeInTheDocument()
    );
  });

  it("shows No-Show action button", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Mark 240115-001 no-show/i })).toBeInTheDocument()
    );
  });

  it("shows Cancel action button", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Cancel 240115-001$/i })).toBeInTheDocument()
    );
  });
});

describe("ReceptionPage — empty queue", () => {
  beforeEach(() => setup([]));
  afterEach(() => vi.clearAllMocks());

  it("shows empty queue message", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Queue is empty/i)).toBeInTheDocument()
    );
  });
});

describe("ReceptionPage — status transitions", () => {
  afterEach(() => vi.clearAllMocks());

  it("opens confirm modal when Call is clicked", async () => {
    setup([makeEntry()]);
    vi.mocked(queueService.updateStatus).mockResolvedValue(makeEntry({ status: "called" }));
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Call 240115-001/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Call 240115-001/i }));
    await waitFor(() =>
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    );
    expect(screen.getByRole("heading", { name: /Call This Customer/i })).toBeInTheDocument();
  });

  it("confirms transition and calls updateStatus", async () => {
    setup([makeEntry()]);
    vi.mocked(queueService.updateStatus).mockResolvedValue(makeEntry({ status: "called" }));
    vi.mocked(queueService.getActiveQueue).mockResolvedValue([makeEntry({ status: "called" })]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Call 240115-001/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Call 240115-001/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /Call Now/i }));
    await waitFor(() =>
      expect(queueService.updateStatus).toHaveBeenCalledWith(1, "called")
    );
  });

  it("cancels the modal without calling updateStatus", async () => {
    setup([makeEntry()]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Call 240115-001/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Call 240115-001/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /Go Back/i }));
    expect(queueService.updateStatus).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("ReceptionPage — barber break toggle", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows Break button for available barbers", async () => {
    setup([]);
    renderPage();
    await waitFor(() => {
      const breakButtons = screen.getAllByRole("button", { name: /Break/i });
      expect(breakButtons.length).toBeGreaterThan(0);
    });
  });

  it("shows Resume button for on-break barbers", async () => {
    setup([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Resume/i })).toBeInTheDocument()
    );
  });

  it("opens break confirmation modal", async () => {
    setup([]);
    vi.mocked(queueService.updateBarberStatus).mockResolvedValue(
      { ...mockBarbers[0], status: "on_break" }
    );
    renderPage();
    await waitFor(() => {
      const breakBtns = screen.getAllByRole("button", { name: /^Break$/i });
      return expect(breakBtns.length).toBeGreaterThan(0);
    });
    const breakBtns = screen.getAllByRole("button", { name: /^Break$/i });
    await userEvent.click(breakBtns[0]);
    await waitFor(() =>
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    );
  });
});

describe("ReceptionPage — walk-in modal", () => {
  beforeEach(() => setup([]));
  afterEach(() => vi.clearAllMocks());

  it("opens the walk-in modal when Add Walk-In is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Walk-In/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Walk-In/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Add Walk-In Customer/i })).toBeInTheDocument();
  });

  it("closes the modal when Cancel is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Walk-In/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Walk-In/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    // Click the Cancel button inside the modal form
    const modal = screen.getByRole("dialog");
    const cancelBtn = within(modal).getByRole("button", { name: /^Cancel$/i });
    await userEvent.click(cancelBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders all services in the walk-in form", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Walk-In/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Walk-In/i }));
    await waitFor(() => {
      expect(screen.getByText("Classic Haircut")).toBeInTheDocument();
      expect(screen.getByText("Royal Shave")).toBeInTheDocument();
    });
  });

  it("shows validation error for empty name on submit", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Walk-In/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Walk-In/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /Add to Queue/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/Name is required/i)
    );
  });

  it("submits the walk-in form with valid data", async () => {
    const newEntry = makeEntry({ id: 99, token: "240115-010", customer_name: "Walk In" });
    vi.mocked(queueService.addWalkIn).mockResolvedValue(newEntry);
    vi.mocked(queueService.getActiveQueue).mockResolvedValue([newEntry]);

    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Walk-In/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /Walk-In/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    await userEvent.type(screen.getByLabelText(/Customer Name/i), "Walk In");
    await userEvent.type(screen.getByLabelText(/Mobile Number/i), "9876543210");

    // Select a service
    const svcBtn = screen.getAllByRole("button", { name: /Classic Haircut/i })[0];
    await userEvent.click(svcBtn);

    await userEvent.click(screen.getByRole("button", { name: /Add to Queue/i }));
    await waitFor(() =>
      expect(queueService.addWalkIn).toHaveBeenCalledWith(expect.objectContaining({
        customer_name: "Walk In",
        phone: "9876543210",
        service_ids: [1],
      }))
    );
  });
});
