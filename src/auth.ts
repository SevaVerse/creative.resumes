import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { upsertOAuthUser } from "@/lib/db/users";

// Auth.js v5 with stateless JWT sessions (no auth tables needed for sessions).
// The JWT carries our own user id (`uid`), created/linked in the DB on first sign-in.
// Env: AUTH_SECRET, AUTH_GOOGLE_ID/SECRET, AUTH_GITHUB_ID/SECRET (providers are
// enabled only when their credentials are set).

const providers: Provider[] = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push(Google);
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub);

export const enabledProviders = providers.map((p) => (typeof p === "function" ? p().id : p.id));

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: { signIn: "/", error: "/" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.uid = await upsertOAuthUser({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email: user?.email ?? (profile?.email as string | undefined) ?? null,
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
