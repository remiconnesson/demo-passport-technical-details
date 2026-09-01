import { getIdentity } from "@vercel/passport";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const identity = await getIdentity();

    if (!identity) {
      return Response.json(
        { authenticated: false, reason: "Passport identity not found" },
        { status: 401 },
      );
    }

    return Response.json({
      authenticated: true,
      identity: {
        subject: identity.subject,
        externalSub: identity.externalSubject,
        email: identity.email ?? null,
        name: identity.name ?? null,
      },
      claims: identity.payload,
    });
  } catch {
    return Response.json(
      {
        authenticated: false,
        reason: "Passport identity could not be verified",
      },
      { status: 401 },
    );
  }
}
