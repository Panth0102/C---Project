import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/pages/HomePage";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("HomePage", () => {
  it("renders the hero heading", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole("heading", { name: /Full-Stack Starter/i })).toBeInTheDocument();
  });

  it("renders all three feature cards", () => {
    renderWithRouter(<HomePage />);
    // Match the h2 card titles exactly to avoid colliding with the subtitle paragraph.
    expect(screen.getByRole("heading", { name: /React \+ Vite/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /FastAPI Backend/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^PostgreSQL$/i })).toBeInTheDocument();
  });

  it("renders View Items link", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole("link", { name: /View Items/i })).toBeInTheDocument();
  });

  it("renders API Docs link", () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByRole("link", { name: /API Docs/i })).toBeInTheDocument();
  });
});
