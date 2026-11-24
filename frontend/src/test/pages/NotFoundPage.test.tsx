import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "@/pages/NotFoundPage";

describe("NotFoundPage", () => {
  it("renders 404 text", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders a back-to-home link", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /Back to Home/i })).toBeInTheDocument();
  });

  it("renders a Join Queue link", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /Join Queue/i })).toBeInTheDocument();
  });
});
