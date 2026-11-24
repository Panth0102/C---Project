import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorMessage } from "@/components/common/ErrorMessage";

describe("ErrorMessage", () => {
  it("renders the error message text", () => {
    render(<ErrorMessage message="Network error" />);
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("renders the alert role", () => {
    render(<ErrorMessage message="Oops" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is absent", () => {
    render(<ErrorMessage message="Oops" />);
    expect(screen.queryByRole("button", { name: /Try again/i })).not.toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    render(<ErrorMessage message="Oops" onRetry={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Try again/i })).toBeInTheDocument();
  });

  it("calls onRetry when the button is clicked", async () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage message="Oops" onRetry={handleRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /Try again/i }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
