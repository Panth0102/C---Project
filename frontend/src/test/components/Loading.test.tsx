import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loading } from "@/components/common/Loading";

describe("Loading", () => {
  it("renders with default message", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Loading…/i)).toBeInTheDocument();
  });

  it("renders a custom message", () => {
    render(<Loading message="Fetching data…" />);
    expect(screen.getByText(/Fetching data…/i)).toBeInTheDocument();
  });

  it("renders an SVG spinner", () => {
    render(<Loading />);
    const svg = document.querySelector("svg");
    expect(svg).toBeTruthy();
  });
});
