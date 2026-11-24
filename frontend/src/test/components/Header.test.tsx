import { render, screen } from "@testing-library/react";
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
  it("renders the app logo text", () => {
    renderHeader();
    expect(screen.getByText(/FullStack App/i)).toBeInTheDocument();
  });

  it("renders the Home navigation link", () => {
    renderHeader();
    // The nav contains a "Home" link; use getAllBy and check at least one exists.
    const homeLinks = screen.getAllByRole("link", { name: /Home/i });
    // One of them is the logo (aria-label="Go to home"), the other is the nav link.
    // We confirm the nav link with text "Home" is present.
    const navHome = homeLinks.find((el) => el.textContent?.trim() === "Home");
    expect(navHome).toBeInTheDocument();
  });

  it("renders the Items navigation link", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /Items/i })).toBeInTheDocument();
  });

  it("logo link points to /", () => {
    renderHeader();
    const logo = screen.getByRole("link", { name: /Go to home/i });
    expect(logo).toHaveAttribute("href", "/");
  });
});
