import "server-only";
import type { Row } from "@libsql/client";
import { getDb, nowIso } from "./client";
import { getResume } from "./resumes";
import type { Resume } from "@/types/database";
import { isTemplateId } from "@/types/resume";

// Opt-in public resume links. Create/read/revoke are scoped by user_id like every resume query;
// only getPublicShare() is unauthenticated, and it returns nothing for revoked or expired links.

export const SHARE_EXPIRY_DAYS = [7, 30, 90] as const;
export type ShareExpiryDays = (typeof SHARE_EXPIRY_DAYS)[number];

export type ResumeShare = {
  id: string;
  resume_id: string;
  indexable: boolean;
  hide_contact: boolean;
  expires_at: string;
  created_at: string;
};

export const SHARE_ID_PATTERN = /^[A-Za-z0-9]{12}$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** 12 random characters (~70 bits): unguessable, short enough to share. */
function newShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = "";
  // ALPHABET drops look-alike characters (0/O, 1/l/I) and is a subset of SHARE_ID_PATTERN.
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

function toShare(row: Row): ResumeShare {
  return {
    id: String(row.id),
    resume_id: String(row.resume_id),
    indexable: Number(row.indexable) === 1,
    hide_contact: Number(row.hide_contact) === 1,
    expires_at: String(row.expires_at),
    created_at: String(row.created_at),
  };
}

/** The resume's current active link, if any. */
export async function getActiveShare(userId: string, resumeId: string): Promise<ResumeShare | null> {
  const db = await getDb();
  const rs = await db.execute({
    sql: `SELECT * FROM resume_shares
          WHERE user_id = ? AND resume_id = ? AND revoked_at IS NULL AND expires_at > ?
          ORDER BY created_at DESC LIMIT 1`,
    args: [userId, resumeId, nowIso()],
  });
  return rs.rows[0] ? toShare(rs.rows[0]) : null;
}

/** Revokes every link to the resume. Returns how many were revoked. */
export async function revokeShares(userId: string, resumeId: string): Promise<number> {
  const db = await getDb();
  const rs = await db.execute({
    sql: "UPDATE resume_shares SET revoked_at = ? WHERE user_id = ? AND resume_id = ? AND revoked_at IS NULL",
    args: [nowIso(), userId, resumeId],
  });
  return rs.rowsAffected;
}

/**
 * Creates a new link for a resume the user owns, replacing any existing one
 * (one active link per resume keeps revocation simple). Returns null if the resume is not theirs.
 */
export async function createShare(
  userId: string,
  resumeId: string,
  opts: { expiresInDays: ShareExpiryDays; indexable: boolean; hideContact: boolean },
): Promise<ResumeShare | null> {
  const resume = await getResume(userId, resumeId);
  if (!resume) return null;
  await revokeShares(userId, resumeId);
  const db = await getDb();
  const id = newShareId();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + opts.expiresInDays * 86_400_000).toISOString();
  await db.execute({
    sql: `INSERT INTO resume_shares (id, resume_id, user_id, indexable, hide_contact, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, resumeId, userId, opts.indexable ? 1 : 0, opts.hideContact ? 1 : 0, expiresAt, createdAt],
  });
  return { id, resume_id: resumeId, indexable: opts.indexable, hide_contact: opts.hideContact, expires_at: expiresAt, created_at: createdAt };
}

/** Public lookup for /r/<id>: only live (not revoked, not expired) links, joined to the owner's resume. */
export async function getPublicShare(id: string): Promise<{ share: ResumeShare; resume: Pick<Resume, "template" | "data" | "last_edited_at"> } | null> {
  if (!SHARE_ID_PATTERN.test(id)) return null;
  const db = await getDb();
  const rs = await db.execute({
    sql: `SELECT s.*, r.template AS r_template, r.data AS r_data, r.last_edited_at AS r_edited
          FROM resume_shares s JOIN resumes r ON r.id = s.resume_id AND r.user_id = s.user_id
          WHERE s.id = ? AND s.revoked_at IS NULL AND s.expires_at > ?`,
    args: [id, nowIso()],
  });
  const row = rs.rows[0];
  if (!row) return null;
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(String(row.r_data)) as Record<string, unknown>;
  } catch {
    data = {};
  }
  return {
    share: toShare(row),
    resume: { template: isTemplateId(row.r_template) ? row.r_template : "minimalist", data, last_edited_at: String(row.r_edited) },
  };
}
