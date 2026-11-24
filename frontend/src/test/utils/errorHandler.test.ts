import axios from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage, isNetworkError } from "@/utils/errorHandler";

describe("getErrorMessage", () => {
  it("returns message for a plain Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns fallback for unknown values", () => {
    expect(getErrorMessage(null)).toBe("An unexpected error occurred.");
    expect(getErrorMessage(42)).toBe("An unexpected error occurred.");
  });

  it("extracts string detail from an Axios error response", () => {
    const err = new axios.AxiosError("Request failed");
    err.response = { data: { detail: "Item not found." }, status: 404 } as never;
    expect(getErrorMessage(err)).toBe("Item not found.");
  });

  it("returns 404 message when no detail present", () => {
    const err = new axios.AxiosError("Not found");
    err.response = { data: {}, status: 404 } as never;
    expect(getErrorMessage(err)).toBe("Resource not found.");
  });

  it("returns 422 message for validation errors without detail array", () => {
    const err = new axios.AxiosError("Validation error");
    err.response = { data: {}, status: 422 } as never;
    expect(getErrorMessage(err)).toBe("Invalid request data. Please check your inputs.");
  });
});

describe("isNetworkError", () => {
  it("returns true when no response", () => {
    const err = new axios.AxiosError("Network Error");
    // response is undefined by default
    expect(isNetworkError(err)).toBe(true);
  });

  it("returns false when there is a response", () => {
    const err = new axios.AxiosError("Server error");
    err.response = { data: {}, status: 500 } as never;
    expect(isNetworkError(err)).toBe(false);
  });

  it("returns false for plain errors", () => {
    expect(isNetworkError(new Error("oops"))).toBe(false);
  });
});
