import NextAuth, { type Profile } from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { upsertOAuthUser } from "@/lib/db/users";
import { logger } from "@/utils/logger";

// Auth.js v5 with stateless JWT sessions (no auth tables needed for sessions).
// The JWT carries our own user id (`uid`), created/linked in the DB on first sign-in.
// Env: AUTH_SECRET, AUTH_GOOGLE_ID/SECRET, AUTH_GITHUB_ID/SECRET (providers are
// enabled only when their credentials are set).

const providers: Provider[] = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push(Google);
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub);

export const enabledProviders = providers.map((p) => (typeof p === "function" ? p().id : p.id));

/** Lower-cased addresses GitHub has verified for this user (needs the `user:email` scope, which Auth.js requests). */
async function githubVerifiedEmails(accessToken: string | undefined): Promise<Set<string>> {
  if (!accessToken) return new Set();
  try {
    const res = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json", "User-Agent": "SecureCV" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return new Set();
    const emails: unknown = await res.json();
    if (!Array.isArray(emails)) return new Set();
    return new Set(
      emails
        .filter((e): e is { email: string; verified: true } => typeof e?.email === "string" && e?.verified === true)
        .map((e) => e.email.toLowerCase()),
    );
  } catch {
    return new Set();
  }
}

/**
 * The sign-in email only if the provider confirms the user owns it, else null.
 * Emails link sign-ins to existing users, so an unverified address must never be stored or matched:
 * that would let anyone who claims someone else's address open their saved resumes.
 */
async function verifiedEmail(
  provider: string,
  email: string | null,
  profile: Profile | undefined,
  accessToken: string | undefined,
): Promise<string | null> {
  if (!email) return null;
  if (provider === "google") return profile?.email_verified === true ? email : null;
  if (provider === "github") return (await githubVerifiedEmails(accessToken)).has(email.trim().toLowerCase()) ? email : null;
  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: { signIn: "/", error: "/" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        const email = user?.email ?? profile?.email ?? null;
        const verified = await verifiedEmail(account.provider, email, profile, account.access_token);
        if (email && !verified) logger.info("auth.email_unverified", { provider: account.provider });
        token.uid = await upsertOAuthUser({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          verifiedEmail: verified,
          name: user?.name ?? null,
          image: user?.image ?? null,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
  },
});
