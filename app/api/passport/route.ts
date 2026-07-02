import { headers } from "next/headers";
import {
  getStringClaim,
  PASSPORT_HEADER,
  parsePassportSession,
} from "@/lib/passport";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestHeaders = await headers();
  const session = parsePassportSession(requestHeaders.get(PASSPORT_HEADER));

  if (session.status !== "authenticated") {
    return Response.json(
      {
        authenticated: false,
        reason:
          session.status === "missing"
            ? "Passport header not present"
            : "Passport token is malformed",
      },
      { status: 401 },
    );
  }

  return Response.json({
    authenticated: true,
    identity: {
      externalSub: getStringClaim(session.claims, "external_sub"),
      email: getStringClaim(session.claims, "email"),
      name: getStringClaim(session.claims, "name"),
    },
    claims: session.claims,
  });
}
