import "server-only";
import { getDb, nowIso } from "./client";

export type OAuthProfile = {
  provider: string;
  providerAccountId: string;
  /** Only an address the provider has verified (see src/auth.ts); pass null otherwise. */
  verifiedEmail?: string | null;
  name?: string | null;
  image?: string | null;
};

/**
 * Finds or creates the local user for an OAuth sign-in and returns its id.
 * Lookup order: linked account -> verified email -> new user.
 * Email linking lets users migrated from Supabase keep their saved resumes, which is why
 * only provider-verified emails may be stored or matched here.
 */
export async function upsertOAuthUser(profile: OAuthProfile): Promise<string> {
  const db = await getDb();
  const email = profile.verifiedEmail?.trim().toLowerCase() || null;
  const now = nowIso();

  const linked = await db.execute({
    sql: "SELECT user_id FROM accounts WHERE provider = ? AND provider_account_id = ?",
    args: [profile.provider, profile.providerAccountId],
  });

  let userId = linked.rows[0]?.user_id as string | undefined;

  if (!userId && email) {
    const byEmail = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] });
    userId = byEmail.rows[0]?.id as string | undefined;
  }

  if (!userId) {
    userId = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO users (id, email, name, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [userId, email, profile.name ?? null, profile.image ?? null, now, now],
    });
  } else {
    // Keep the stored email if the new one already belongs to another user: users.email is
    // UNIQUE, and a failed update here would block this user from signing in at all.
    await db.execute({
      sql: `UPDATE users SET
              email = CASE
                WHEN ? IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE email = ? AND id <> ?) THEN ?
                ELSE email
              END,
              name = COALESCE(?, name),
              image = COALESCE(?, image),
              updated_at = ?
            WHERE id = ?`,
      args: [email, email, userId, email, profile.name ?? null, profile.image ?? null, now, userId],
    });
  }

  await db.execute({
    sql: `INSERT INTO accounts (provider, provider_account_id, user_id, created_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT (provider, provider_account_id) DO NOTHING`,
    args: [profile.provider, profile.providerAccountId, userId, now],
  });

  return userId;
}
