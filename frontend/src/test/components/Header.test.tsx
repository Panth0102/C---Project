import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Header } from "@/components/layout/Header";

function renderHeader(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
    </MemoryRouter>
  );
}

describe("Header", () => {
  it("renders the salon name", () => {
    renderHeader();
    expect(screen.getByText(/The Sovereign Blade/i)).toBeInTheDocument();
  });

  it("renders the logo link pointing to /", () => {
    renderHeader();
    const logoLink = screen.getByRole("link", { name: /The Sovereign Blade.*Home/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("renders Join Queue CTA link in desktop nav", () => {
    renderHeader();
    // Desktop CTA link
    const joinLinks = screen.getAllByRole("link", { name: /Join Queue/i });
    expect(joinLinks.length).toBeGreaterThan(0);
    expect(joinLinks[0]).toHaveAttribute("href", "/join");
  });

  it("renders navigation links for Services, Barbers, About", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /Services/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Barbers/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /About/i })).toBeInTheDocument();
  });

  it("mobile menu opens when hamburger is clicked", async () => {
    renderHeader();
    const burger = screen.getByRole("button", { name: /Toggle mobile menu/i });
    await userEvent.click(burger);
    expect(screen.getByRole("navigation", { name: /Mobile navigation/i })).toBeInTheDocument();
  });

  it("renders language toggle button", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /Toggle language/i })).toBeInTheDocument();
  });
});
