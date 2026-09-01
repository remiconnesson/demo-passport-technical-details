import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Clock3,
  Code2,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  RotateCw,
  Server,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import {
  formatClaimValue,
  getNumericClaim,
  getPassportSession,
  getStringClaim,
  type PassportClaims,
  type PassportSession,
} from "@/lib/passport";

export const dynamic = "force-dynamic";

const passportGuideUrl = "https://vercel.com/kb/guide/vercel-passport";

type ProofState = "complete" | "waiting" | "error";

export default async function Home() {
  const session = await getPassportSession();
  const isVercel = process.env.VERCEL === "1";

  return (
    <div className="min-h-screen bg-[#f4f4f0] text-[#171717]">
      <SiteHeader session={session} />
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 min-[375px]:px-6 md:px-8">
        {session.status === "authenticated" ? (
          <IdentityStrip claims={session.claims} />
        ) : null}
        <Hero session={session} isVercel={isVercel} />
        {session.status === "authenticated" ? (
          <ClaimsTable claims={session.claims} />
        ) : (
          <UnavailableDetails session={session} isVercel={isVercel} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader({ session }: { session: PassportSession }) {
  const authenticated = session.status === "authenticated";

  return (
    <header className="border-b border-black bg-[#171717] text-white">
      <div className="mx-auto flex min-h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-4 min-[375px]:px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Image src="/vercel.svg" alt="" width={18} height={16} priority />
          <div className="h-6 w-px bg-white/30" />
          <p className="truncate text-sm font-medium">Vercel Passport</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <span
            className={`h-2 w-2 ${authenticated ? "bg-[#7ce38b]" : "bg-[#f5a623]"}`}
          />
          <span>{authenticated ? "Identity verified" : "Proof pending"}</span>
        </div>
      </div>
    </header>
  );
}

function Hero({
  session,
  isVercel,
}: {
  session: PassportSession;
  isVercel: boolean;
}) {
  const content = getHeroContent(session, isVercel);
  const proofState: ProofState =
    session.status === "authenticated"
      ? "complete"
      : session.status === "invalid"
        ? "error"
        : "waiting";

  return (
    <section className="border-x border-b border-black bg-white">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-black p-6 md:p-8 lg:border-r lg:border-b-0 lg:p-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase">
              <span className={`h-2 w-2 ${content.statusColor}`} />
              {content.eyebrow}
            </div>
            <h1 className="mt-6 max-w-[720px] text-4xl leading-[1.08] font-semibold md:text-5xl">
              {content.title}
            </h1>
            <p className="mt-4 max-w-[65ch] text-base leading-7 text-[#5f5f5f]">
              {content.description}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/"
              className="inline-flex min-h-11 items-center gap-2 border border-black bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-[#343434] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <RotateCw className="size-4" aria-hidden="true" />
              Refresh proof
            </a>
            <a
              href="/api/passport"
              className="inline-flex min-h-11 items-center gap-2 border border-black bg-white px-4 text-sm font-medium transition-colors hover:bg-[#eeeeea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <Code2 className="size-4" aria-hidden="true" />
              View server JSON
            </a>
          </div>
        </div>
        <ProofPanel state={proofState} />
      </div>
    </section>
  );
}

function ProofPanel({ state }: { state: ProofState }) {
  const completed = state === "complete";
  const steps = [
    {
      icon: KeyRound,
      title: "Identity provider",
      description: completed
        ? "Authorization completed"
        : "Awaiting authorization",
    },
    {
      icon: ShieldCheck,
      title: "Vercel edge",
      description: completed ? "Session validated" : "No session evidence",
    },
    {
      icon: Server,
      title: "Next.js server",
      description: completed ? "Signed header received" : "Header not received",
    },
  ];

  return (
    <aside className="flex flex-col bg-[#e8f1ff] p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase">Request proof</p>
          <p className="mt-2 text-sm text-[#4a5565]">
            {completed ? "3 of 3 checks complete" : "Checks incomplete"}
          </p>
        </div>
        {state === "error" ? (
          <CircleAlert className="size-5 text-[#b42318]" aria-hidden="true" />
        ) : (
          <LockKeyhole className="size-5" aria-hidden="true" />
        )}
      </div>
      <ol className="mt-6 flex flex-1 flex-col justify-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="grid grid-cols-[32px_1fr_20px] items-center gap-4 border-t border-black/20 py-4 last:border-b"
            >
              <span className="flex size-8 items-center justify-center border border-black/30 bg-white/60">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  <span className="mr-2 font-mono text-xs text-[#5f6670]">
                    0{index + 1}
                  </span>
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-[#4a5565]">
                  {step.description}
                </p>
              </div>
              {completed ? (
                <Check className="size-4" aria-label="Complete" />
              ) : (
                <Clock3 className="size-4" aria-label="Waiting" />
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function IdentityStrip({ claims }: { claims: PassportClaims }) {
  const displayName =
    getStringClaim(claims, "name") ??
    getStringClaim(claims, "email") ??
    "Authenticated visitor";
  const externalSubject =
    getStringClaim(claims, "external_sub") ??
    getStringClaim(claims, "sub") ??
    "Not provided";
  const connector = getStringClaim(claims, "connector_id") ?? "Not provided";

  return (
    <section className="grid border-x border-b border-black bg-[#171717] text-white md:grid-cols-2 lg:grid-cols-3">
      <IdentityFact
        icon={Fingerprint}
        label="Authenticated visitor"
        value={displayName}
        className="md:col-span-2 lg:col-span-1 lg:border-r lg:border-b-0"
      />
      <IdentityFact
        icon={KeyRound}
        label="External subject"
        value={externalSubject}
        monospace
        className="md:border-r md:border-b-0"
      />
      <IdentityFact
        icon={ShieldCheck}
        label="Passport connector"
        value={connector}
        monospace
        className="md:border-b-0"
      />
    </section>
  );
}

function IdentityFact({
  icon: Icon,
  label,
  value,
  monospace = false,
  className = "",
}: {
  icon: typeof Fingerprint;
  label: string;
  value: string;
  monospace?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex min-w-0 items-start gap-4 border-b border-white/20 p-6 last:border-b-0 ${className}`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center border border-white/15 bg-white/5">
        <Icon className="size-5 text-[#7ce38b]" aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-1">
        <p className="text-xs font-medium text-white/60 uppercase">{label}</p>
        <p
          className={`mt-2 break-all ${monospace ? "font-mono text-sm" : "text-lg font-medium"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ClaimsTable({ claims }: { claims: PassportClaims }) {
  const issuedAt = getNumericClaim(claims, "iat");
  const expiresAt = getNumericClaim(claims, "exp");
  const rows = Object.entries(claims).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return (
    <section className="border-x border-b border-black bg-white">
      <div className="flex flex-col justify-between gap-6 border-b border-black p-6 md:flex-row md:items-end md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase">Decoded server-side</p>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            Passport identity claims
          </h2>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-[#5f5f5f]">
          <span>Issued {formatTimestamp(issuedAt)}</span>
          <span>Expires {formatTimestamp(expiresAt)}</span>
        </div>
      </div>
      <dl>
        {rows.map(([key, value]) => (
          <div
            key={key}
            className="grid border-b border-black/15 last:border-b-0 md:grid-cols-[200px_1fr]"
          >
            <dt className="bg-[#eeeeea] px-6 py-4 font-mono text-xs font-semibold md:px-8">
              {key}
            </dt>
            <dd className="break-all px-6 py-4 font-mono text-xs leading-6 md:px-8">
              {formatClaimValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function UnavailableDetails({
  session,
  isVercel,
}: {
  session: PassportSession;
  isVercel: boolean;
}) {
  const isInvalid = session.status === "invalid";

  return (
    <section className="grid border-x border-b border-black bg-[#171717] text-white md:grid-cols-[1fr_2fr]">
      <div className="border-b border-white/20 p-6 md:border-r md:border-b-0 md:p-8">
        <CircleAlert
          className={`size-8 ${isInvalid ? "text-[#ff8f86]" : "text-[#f5c26b]"}`}
          aria-hidden="true"
        />
        <p className="mt-8 text-xs font-semibold text-white/60 uppercase">
          Evidence status
        </p>
        <p className="mt-2 text-xl font-semibold">
          {isInvalid ? "Unreadable token" : "Header not present"}
        </p>
      </div>
      <div className="p-6 md:p-8">
        <p className="max-w-[65ch] text-base leading-7 text-white/70">
          {isVercel
            ? "This request reached the deployment without a readable Passport identity header, so the app cannot mark it as verified."
            : "Local development does not pass through Vercel Deployment Protection. The live deployment supplies the verified identity header after Passport sign-in."}
        </p>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-black bg-[#f4f4f0]">
      <div className="mx-auto flex min-h-24 w-full max-w-[1280px] flex-col justify-between gap-4 px-4 py-6 min-[375px]:px-6 md:flex-row md:items-center md:px-8">
        <p className="max-w-[65ch] text-xs leading-5 text-[#5f5f5f]">
          The raw Passport token remains server-side. This page displays only
          its decoded claims.
        </p>
        <a
          href={passportGuideUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline decoration-black/30 underline-offset-4 hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Read the Passport guide
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

function getHeroContent(session: PassportSession, isVercel: boolean) {
  if (session.status === "authenticated") {
    return {
      eyebrow: "Protected request accepted",
      statusColor: "bg-[#1a7f37]",
      title: "Passport approved this request.",
      description:
        "The identity provider completed sign-in, Vercel validated the session, and this server-rendered page received the signed Passport claims.",
    };
  }

  if (session.status === "invalid") {
    return {
      eyebrow: "Verification failed",
      statusColor: "bg-[#d92d20]",
      title: "Passport proof is unreadable.",
      description:
        "A Passport header reached the server, but its JWT payload could not be decoded into a valid claims object.",
    };
  }

  return {
    eyebrow: isVercel ? "Verification incomplete" : "Local preview",
    statusColor: "bg-[#f5a623]",
    title: "Passport proof appears after sign-in.",
    description: isVercel
      ? "This deployment did not receive the Passport identity header required to prove that the request completed the protected sign-in flow."
      : "This local preview shows the verification surface. The deployed app becomes complete when Vercel injects the signed Passport identity header.",
  };
}

function formatTimestamp(value: number | null): string {
  if (value === null) return "not provided";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value * 1000));
}
