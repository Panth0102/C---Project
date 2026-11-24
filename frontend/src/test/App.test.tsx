import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "@/App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    // The router renders the home page by default.
    expect(document.body).toBeTruthy();
  });

  it("renders the home page heading", () => {
    render(<App />);
    expect(screen.getByText(/Full-Stack Starter/i)).toBeInTheDocument();
  });
});
