import "server-only";
import { getDb, nowIso } from "./client";

export type OAuthProfile = {
  provider: string;
  providerAccountId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

/**
 * Finds or creates the local user for an OAuth sign-in and returns its id.
 * Lookup order: linked account -> verified email (Google/GitHub only) -> new user.
 * Email linking lets users migrated from Supabase keep their saved resumes.
 */
export async function upsertOAuthUser(profile: OAuthProfile): Promise<string> {
  const db = await getDb();
  const email = profile.email?.trim().toLowerCase() || null;
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
    await db.execute({
      sql: `UPDATE users SET
              email = COALESCE(?, email),
              name = COALESCE(?, name),
              image = COALESCE(?, image),
              updated_at = ?
            WHERE id = ?`,
      args: [email, profile.name ?? null, profile.image ?? null, now, userId],
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
