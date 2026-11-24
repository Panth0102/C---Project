import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JoinQueuePage } from "@/pages/JoinQueuePage";
import type { ApiBarber, ApiService } from "@/types/api";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("@/services/queueService", () => ({
  queueService: {
    getServices: vi.fn(),
    getBarbers:  vi.fn(),
    joinQueue:   vi.fn(),
  },
}));

import { queueService } from "@/services/queueService";

// ── Fixtures — integer IDs, matching what the backend returns ─────────────────

const mockServices: ApiService[] = [
  { id: 1, name: "Classic Haircut",    price: 250, duration: 30, description: "Precision scissor cut", icon: "✂️", is_active: true },
  { id: 2, name: "Royal Shave",        price: 350, duration: 45, description: "Straight-razor shave",  icon: "🪒", is_active: true },
  { id: 3, name: "Beard Trim & Shape", price: 200, duration: 20, description: "Expert sculpting",      icon: "✦", is_active: true },
  { id: 4, name: "Hair & Beard Combo", price: 450, duration: 50, description: "Full combo",            icon: "⚜️", is_active: true },
  { id: 5, name: "Head Massage",       price: 150, duration: 15, description: "Oil massage",           icon: "◈", is_active: true },
  { id: 6, name: "Hair Colour",        price: 600, duration: 60, description: "Colour treatment",      icon: "✦", is_active: true },
];

const mockBarbers: ApiBarber[] = [
  { id: 1, name: "Rajan Mehta", specialty: "Classic Cuts & Shaves", status: "available", is_active: true, initials: "RM" },
  { id: 2, name: "Arjun Shah",  specialty: "Modern Fades & Colour", status: "available", is_active: true, initials: "AS" },
  { id: 3, name: "Dev Patel",   specialty: "Beard Architecture",    status: "on_break",  is_active: true, initials: "DP" },
  { id: 4, name: "Kiran Joshi", specialty: "Traditional Techniques",status: "available", is_active: true, initials: "KJ" },
];

function setup() {
  vi.mocked(queueService.getServices).mockResolvedValue(mockServices);
  vi.mocked(queueService.getBarbers).mockResolvedValue(mockBarbers);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <JoinQueuePage />
    </MemoryRouter>
  );
}

// ── Helper: wait until the services have loaded ───────────────────────────────
async function waitForServicesToLoad() {
  await waitFor(() =>
    expect(screen.getByRole("button", { name: /Classic Haircut/i })).toBeInTheDocument()
  );
}

describe("JoinQueuePage — Step 1 (Services)", () => {
  beforeEach(() => setup());

  it("renders the page heading", async () => {
    renderPage();
    await waitForServicesToLoad();
    expect(screen.getByRole("heading", { name: /Join the Queue/i })).toBeInTheDocument();
  });

  it("renders the step 1 heading", async () => {
    renderPage();
    await waitForServicesToLoad();
    expect(screen.getByRole("heading", { name: /Select Services/i })).toBeInTheDocument();
  });

  it("renders all 6 service options", async () => {
    renderPage();
    await waitForServicesToLoad();
    const buttons = screen.getAllByRole("button", { name: /haircut|shave|beard|combo|massage|colour/i });
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it("Continue button is disabled when no services selected", async () => {
    renderPage();
    await waitForServicesToLoad();
    expect(screen.getByRole("button", { name: /Continue/i })).toBeDisabled();
  });

  it("selects a service when clicked", async () => {
    renderPage();
    await waitForServicesToLoad();
    const btn = screen.getByRole("button", { name: /Classic Haircut/i });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("enables Continue after selecting a service", async () => {
    renderPage();
    await waitForServicesToLoad();
    await userEvent.click(screen.getByRole("button", { name: /Classic Haircut/i }));
    expect(screen.getByRole("button", { name: /Continue/i })).not.toBeDisabled();
  });

  it("prevents selecting more than 3 services", async () => {
    renderPage();
    await waitForServicesToLoad();
    const serviceButtons = screen.getAllByRole("button", { name: /haircut|shave|beard|combo|massage|colour/i });
    await userEvent.click(serviceButtons[0]);
    await userEvent.click(serviceButtons[1]);
    await userEvent.click(serviceButtons[2]);
    expect(serviceButtons[3]).toBeDisabled();
  });

  it("shows warning banner at max selection", async () => {
    renderPage();
    await waitForServicesToLoad();
    const serviceButtons = screen.getAllByRole("button", { name: /haircut|shave|beard|combo|massage|colour/i });
    await userEvent.click(serviceButtons[0]);
    await userEvent.click(serviceButtons[1]);
    await userEvent.click(serviceButtons[2]);
    expect(screen.getByRole("status")).toHaveTextContent(/Maximum 3 services/i);
  });

  it("deselects a service when clicked again", async () => {
    renderPage();
    await waitForServicesToLoad();
    const btn = screen.getByRole("button", { name: /Classic Haircut/i });
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });
});

describe("JoinQueuePage — Step 2 (Barber)", () => {
  beforeEach(() => setup());

  async function goToStep2() {
    renderPage();
    await waitForServicesToLoad();
    await userEvent.click(screen.getByRole("button", { name: /Classic Haircut/i }));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
  }

  it("navigates to step 2 after continuing", async () => {
    await goToStep2();
    expect(screen.getByRole("heading", { name: /Choose Your Barber/i })).toBeInTheDocument();
  });

  it("renders Any Available Barber option", async () => {
    await goToStep2();
    expect(screen.getByRole("button", { name: /Any Available Barber/i })).toBeInTheDocument();
  });

  it("unavailable barbers are disabled", async () => {
    await goToStep2();
    // Dev Patel has status: "on_break"
    expect(screen.getByRole("button", { name: /Dev Patel/i })).toBeDisabled();
  });

  it("selects a barber when clicked", async () => {
    await goToStep2();
    const btn = screen.getByRole("button", { name: /Rajan Mehta/i });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("Back button returns to step 1", async () => {
    await goToStep2();
    await userEvent.click(screen.getByRole("button", { name: /← Back/i }));
    expect(screen.getByRole("heading", { name: /Select Services/i })).toBeInTheDocument();
  });
});

describe("JoinQueuePage — Step 3 (Details)", () => {
  beforeEach(() => setup());

  async function goToStep3() {
    renderPage();
    await waitForServicesToLoad();
    await userEvent.click(screen.getByRole("button", { name: /Classic Haircut/i }));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
  }

  it("navigates to step 3", async () => {
    await goToStep3();
    expect(screen.getByRole("heading", { name: /Your Details/i })).toBeInTheDocument();
  });

  it("renders name and phone inputs", async () => {
    await goToStep3();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
  });

  it("shows name validation error on empty submit", async () => {
    await goToStep3();
    await userEvent.click(screen.getByRole("button", { name: /Review Order/i }));
    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBeGreaterThan(0);
    const nameAlert = alerts.find((el) => el.textContent?.match(/required/i));
    expect(nameAlert).toBeInTheDocument();
  });

  it("shows phone validation error for invalid number", async () => {
    await goToStep3();
    await userEvent.type(screen.getByLabelText(/Full Name/i), "Ravi Kumar");
    await userEvent.type(screen.getByLabelText(/Mobile Number/i), "1234567890");
    await userEvent.click(screen.getByRole("button", { name: /Review Order/i }));
    const alerts = screen.getAllByRole("alert");
    const phoneAlert = alerts.find((el) => el.textContent?.match(/valid.*10-digit/i));
    expect(phoneAlert).toBeInTheDocument();
  });

  it("accepts a valid Indian mobile number", async () => {
    await goToStep3();
    await userEvent.type(screen.getByLabelText(/Full Name/i), "Ravi Kumar");
    await userEvent.type(screen.getByLabelText(/Mobile Number/i), "9876543210");
    await userEvent.click(screen.getByRole("button", { name: /Review Order/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("submits joinQueue with integer service IDs", async () => {
    vi.mocked(queueService.joinQueue).mockResolvedValue({
      id: 1, token: "240115-001", customer_name: "Ravi Kumar", phone: "9876543210",
      status: "waiting", position: 1, estimated_wait_minutes: 30, total_price: 250,
      total_duration: 30, barber_locked: false, called_at: null, started_at: null,
      completed_at: null, created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), barber: null,
      services: [mockServices[0]],
    });
    await goToStep3();
    await userEvent.type(screen.getByLabelText(/Full Name/i), "Ravi Kumar");
    await userEvent.type(screen.getByLabelText(/Mobile Number/i), "9876543210");
    await userEvent.click(screen.getByRole("button", { name: /Review Order/i }));
    await userEvent.click(screen.getByRole("button", { name: /Confirm & Join/i }));
    await waitFor(() =>
      expect(queueService.joinQueue).toHaveBeenCalledWith(expect.objectContaining({
        service_ids: [1],              // integer, not "s1"
        customer_name: "Ravi Kumar",
        phone: "9876543210",
        barber_id: null,
      }))
    );
  });
});

describe("JoinQueuePage — Order Summary", () => {
  beforeEach(() => setup());

  it("updates total price when a service is selected", async () => {
    renderPage();
    await waitForServicesToLoad();
    await userEvent.click(screen.getByRole("button", { name: /Classic Haircut/i }));
    const priceElements = screen.getAllByText("₹250");
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it("shows no services message when nothing is selected", async () => {
    renderPage();
    await waitForServicesToLoad();
    expect(screen.getByText(/No services selected yet/i)).toBeInTheDocument();
  });
});
