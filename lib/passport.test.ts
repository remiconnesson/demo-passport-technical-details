import { describe, expect, it } from "vitest";
import {
  formatClaimValue,
  getNumericClaim,
  getStringClaim,
  parsePassportSession,
} from "@/lib/passport";

function createToken(payload: unknown): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encode({ alg: "RS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

describe("parsePassportSession", () => {
  it("returns the decoded claims from a JWT payload", () => {
    const session = parsePassportSession(
      createToken({
        external_sub: "00u123",
        email: "demo@example.com",
        exp: 1_800_000_000,
      }),
    );

    expect(session).toEqual({
      status: "authenticated",
      claims: {
        external_sub: "00u123",
        email: "demo@example.com",
        exp: 1_800_000_000,
      },
    });
  });

  it("distinguishes a missing token from a malformed token", () => {
    expect(parsePassportSession(null)).toEqual({ status: "missing" });
    expect(parsePassportSession("not-a-jwt")).toEqual({ status: "invalid" });
    expect(parsePassportSession("a.invalid-json.c")).toEqual({
      status: "invalid",
    });
  });

  it("rejects payloads that are not claim objects", () => {
    expect(parsePassportSession(createToken(["not", "claims"]))).toEqual({
      status: "invalid",
    });
  });
});

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
