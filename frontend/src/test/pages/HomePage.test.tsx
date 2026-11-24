import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/pages/HomePage";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("HomePage", () => {
  it("renders the hero h1 heading", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders Join Queue links", () => {
    renderWithRouter(<HomePage />);
    const links = screen.getAllByRole("link", { name: /Join Queue/i });
    expect(links.length).toBeGreaterThan(0);
  });

  it("renders the Services section heading", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole("heading", { name: /Services & Pricing/i })).toBeInTheDocument();
  });

  it("renders the Barbers section heading", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole("heading", { name: /Our Barbers/i })).toBeInTheDocument();
  });

  it("renders all 6 sample service cards", () => {
    renderWithRouter(<HomePage />);
    // All 6 services have article elements
    expect(screen.getAllByRole("article").length).toBeGreaterThanOrEqual(6);
    // Classic Haircut text appears in a card
    expect(screen.getAllByText(/Classic Haircut/i).length).toBeGreaterThan(0);
  });

  it("renders all barber cards", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/Rajan Mehta/i)).toBeInTheDocument();
    expect(screen.getByText(/Arjun Shah/i)).toBeInTheDocument();
  });

  it("renders live queue status indicators", () => {
    renderWithRouter(<HomePage />);
    // The live status bar contains these labels
    expect(screen.getByText(/^Live$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Waiting$/i)).toBeInTheDocument();
  });

  it("renders opening hours section", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole("heading", { name: /Opening Hours/i })).toBeInTheDocument();
  });
});
