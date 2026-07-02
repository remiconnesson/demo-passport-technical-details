export const PASSPORT_HEADER = "x-vercel-oidc-passport-token";

export type PassportClaims = Record<string, unknown>;

export type PassportSession =
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "authenticated"; claims: PassportClaims };

export function parsePassportSession(token: string | null): PassportSession {
  if (!token) return { status: "missing" };

  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return { status: "invalid" };
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    );

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return { status: "invalid" };
    }

    return { status: "authenticated", claims: payload as PassportClaims };
  } catch {
    return { status: "invalid" };
  }
}

export function getStringClaim(
  claims: PassportClaims,
  key: string,
): string | null {
  const value = claims[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getNumericClaim(
  claims: PassportClaims,
  key: string,
): number | null {
  const value = claims[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function formatClaimValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null) return "null";

  try {
    return JSON.stringify(value);
  } catch {
    return "[unreadable value]";
  }
}
