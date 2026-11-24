import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "@/App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it("renders the vintage salon title", () => {
    render(<App />);
    // The hero h1 contains "The Sovereign" (split across lines)
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
