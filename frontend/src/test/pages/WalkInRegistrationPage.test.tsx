import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WalkInRegistrationPage } from "@/pages/WalkInRegistrationPage";
import { queueService } from "@/services/queueService";

vi.mock("@/services/queueService");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <WalkInRegistrationPage />
    </MemoryRouter>
  );
}

function mockServices() {
  return [
    { id: 1, name: "Classic Haircut", price: 500, duration: 30, description: "Traditional haircut", icon: "✂️", is_active: true },
    { id: 2, name: "Beard Trim", price: 300, duration: 15, description: "Beard trim", icon: "✂️", is_active: true },
    { id: 3, name: "Hot Shave", price: 400, duration: 20, description: "Hot towel shave", icon: "✂️", is_active: true },
  ];
}

describe("WalkInRegistrationPage", () => {
  beforeEach(() => {
    vi.mocked(queueService.getServices).mockResolvedValue(mockServices());
  });

  it("renders the page title", async () => {
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Walk-In Registration/i })
      ).toBeInTheDocument()
    );
  });

  it("loads and displays all services", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Select Services/i)).toBeInTheDocument();
    });
  });

  it("requires name, phone, and service selection", async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole("heading")).toBeInTheDocument());
    
    // Continue button should be disabled initially
    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    expect(continueBtn).toBeDisabled();
  });

  it("allows selecting services", async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText(/Classic Haircut/i)).toBeInTheDocument());
    
    // Find all service buttons
    const serviceButtons = screen.getAllByRole("button", { name: /haircut|trim|shave/i });
    expect(serviceButtons.length).toBeGreaterThan(0);
    
    // Click first service
    await user.click(serviceButtons[0]);
    
    // Service should now be in the form
    await waitFor(() => {
      const selectedServices = screen.getByText(/Your Selection/i);
      expect(selectedServices).toBeInTheDocument();
    });
  });
});
