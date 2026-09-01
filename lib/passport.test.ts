import { describe, expect, it } from "vitest";
import {
  formatClaimValue,
  getNumericClaim,
  getStringClaim,
} from "@/lib/passport";

describe("claim helpers", () => {
  const claims = {
    external_sub: "00u123",
    exp: 1_800_000_000,
    groups: ["engineering", "sales"],
  };

  it("returns only claims with the expected primitive type", () => {
    expect(getStringClaim(claims, "external_sub")).toBe("00u123");
    expect(getStringClaim(claims, "exp")).toBeNull();
    expect(getNumericClaim(claims, "exp")).toBe(1_800_000_000);
    expect(getNumericClaim(claims, "external_sub")).toBeNull();
  });

  it("formats structured claim values without losing their contents", () => {
    expect(formatClaimValue(claims.groups)).toBe('["engineering","sales"]');
  });
});
