import { getIdentity } from "@vercel/passport";

export const PASSPORT_HEADER = "x-vercel-oidc-passport-token";

export type PassportClaims = Record<string, unknown>;

export type PassportSession =
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "authenticated"; claims: PassportClaims };

export async function getPassportSession(): Promise<PassportSession> {
  try {
    const identity = await getIdentity();

    if (!identity) return { status: "missing" };

    return {
      status: "authenticated",
      claims: identity.payload,
    };
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
