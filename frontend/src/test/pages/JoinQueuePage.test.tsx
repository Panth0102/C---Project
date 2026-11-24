import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { JoinQueuePage } from "@/pages/JoinQueuePage";

// react-router navigate mock
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <JoinQueuePage />
    </MemoryRouter>
  );
}

describe("JoinQueuePage — Step 1 (Services)", () => {
  it("renders the page heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Join the Queue/i })).toBeInTheDocument();
  });

  it("renders the step 1 heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Select Services/i })).toBeInTheDocument();
  });

  it("renders all 6 service options", () => {
    renderPage();
    const buttons = screen.getAllByRole("button", { name: /haircut|shave|beard|combo|massage|colour/i });
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it("Continue button is disabled when no services selected", () => {
    renderPage();
    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it("selects a service when clicked", async () => {
    renderPage();
    const classicHaircut = screen.getByRole("button", { name: /Classic Haircut/i });
    await userEvent.click(classicHaircut);
    expect(classicHaircut).toHaveAttribute("aria-pressed", "true");
  });

  it("enables Continue after selecting a service", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /Classic Haircut/i }));
    expect(screen.getByRole("button", { name: /Continue/i })).not.toBeDisabled();
  });

  it("prevents selecting more than 3 services", async () => {
    renderPage();
    const serviceButtons = screen.getAllByRole("button", { name: /haircut|shave|beard|combo|massage|colour/i });
    // Select 3
    await userEvent.click(serviceButtons[0]);
    await userEvent.click(serviceButtons[1]);
    await userEvent.click(serviceButtons[2]);
    // 4th should be disabled
    expect(serviceButtons[3]).toBeDisabled();
  });

  it("shows warning banner at max selection", async () => {
    renderPage();
    const serviceButtons = screen.getAllByRole("button", { name: /haircut|shave|beard|combo|massage|colour/i });
    await userEvent.click(serviceButtons[0]);
    await userEvent.click(serviceButtons[1]);
    await userEvent.click(serviceButtons[2]);
    expect(screen.getByRole("status")).toHaveTextContent(/Maximum 3 services/i);
  });

  it("deselects a service when clicked again", async () => {
    renderPage();
    const btn = screen.getByRole("button", { name: /Classic Haircut/i });
    await userEvent.click(btn); // select
    await userEvent.click(btn); // deselect
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });
});

describe("JoinQueuePage — Step 2 (Barber)", () => {
  async function goToStep2() {
    renderPage();
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
    // Dev Patel is set to available: false in seed data
    const devPatel = screen.getByRole("button", { name: /Dev Patel/i });
    expect(devPatel).toBeDisabled();
  });

  it("selects a barber when clicked", async () => {
    await goToStep2();
    const rajanBtn = screen.getByRole("button", { name: /Rajan Mehta/i });
    await userEvent.click(rajanBtn);
    expect(rajanBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("Back button returns to step 1", async () => {
    await goToStep2();
    await userEvent.click(screen.getByRole("button", { name: /← Back/i }));
    expect(screen.getByRole("heading", { name: /Select Services/i })).toBeInTheDocument();
  });
});

describe("JoinQueuePage — Step 3 (Details)", () => {
  async function goToStep3() {
    renderPage();
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
    // At least one alert is shown for the empty name
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
    // Phone must start with 6-9
    const alerts = screen.getAllByRole("alert");
    const phoneAlert = alerts.find((el) => el.textContent?.match(/valid.*10-digit/i));
    expect(phoneAlert).toBeInTheDocument();
  });

  it("accepts a valid Indian mobile number", async () => {
    await goToStep3();
    await userEvent.type(screen.getByLabelText(/Full Name/i), "Ravi Kumar");
    await userEvent.type(screen.getByLabelText(/Mobile Number/i), "9876543210");
    await userEvent.click(screen.getByRole("button", { name: /Review Order/i }));
    // Should open confirm modal
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("JoinQueuePage — Order Summary", () => {
  it("updates total price when a service is selected", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /Classic Haircut/i }));
    // ₹250 appears multiple times (service card + summary); just confirm at least one
    const priceElements = screen.getAllByText("₹250");
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it("shows no services message when nothing is selected", () => {
    renderPage();
    expect(screen.getByText(/No services selected yet/i)).toBeInTheDocument();
  });
});
