import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /Click me/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled and shows spinner while loading", () => {
    render(<Button loading>Saving…</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.querySelector("svg")).toBeTruthy();
  });

  it("does not fire onClick when disabled", async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Nope</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies danger variant class (red background)", () => {
    render(<Button variant="danger">Delete</Button>);
    // The vintage danger variant uses bg-red-900/80
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-red/);
  });

  it("applies secondary variant class (transparent background)", () => {
    render(<Button variant="secondary">Cancel</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-transparent/);
  });

  it("applies primary variant class (copper background)", () => {
    render(<Button variant="primary">Submit</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-copper/);
  });
});
