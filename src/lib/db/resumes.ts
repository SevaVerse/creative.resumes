import "server-only";
import type { Row } from "@libsql/client";
import { getDb, nowIso } from "./client";
import type { Resume, ResumeUpdate } from "@/types/database";
import { isTemplateId } from "@/types/resume";

// Every query is scoped by user_id: this replaces Supabase Row Level Security.

function toResume(row: Row): Resume {
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(String(row.data)) as Record<string, unknown>;
  } catch {
    data = {};
  }
  const template = isTemplateId(row.template) ? row.template : "minimalist";
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    name: String(row.name),
    template,
    data,
    last_edited_at: String(row.last_edited_at),
    created_at: String(row.created_at),
  };
}

export async function listResumes(userId: string): Promise<Resume[]> {
  const db = await getDb();
  const rs = await db.execute({
    sql: "SELECT * FROM resumes WHERE user_id = ? ORDER BY last_edited_at DESC LIMIT 100",
    args: [userId],
  });
  return rs.rows.map(toResume);
}

export async function getResume(userId: string, id: string): Promise<Resume | null> {
  const db = await getDb();
  const rs = await db.execute({
    sql: "SELECT * FROM resumes WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return rs.rows[0] ? toResume(rs.rows[0]) : null;
}

export async function createResume(
  userId: string,
  input: Required<Pick<Resume, "name" | "template" | "data">>
): Promise<Resume> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const now = nowIso();
  await db.execute({
    sql: `INSERT INTO resumes (id, user_id, name, template, data, last_edited_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, userId, input.name, input.template, JSON.stringify(input.data), now, now],
  });
  return { id, user_id: userId, ...input, last_edited_at: now, created_at: now };
}

export async function updateResume(userId: string, id: string, updates: ResumeUpdate): Promise<Resume | null> {
  const db = await getDb();
  const sets: string[] = [];
  const args: (string | null)[] = [];
  if (updates.name !== undefined) { sets.push("name = ?"); args.push(updates.name); }
  if (updates.template !== undefined) { sets.push("template = ?"); args.push(updates.template); }
  if (updates.data !== undefined) { sets.push("data = ?"); args.push(JSON.stringify(updates.data)); }
  sets.push("last_edited_at = ?");
  args.push(nowIso());

  const rs = await db.execute({
    sql: `UPDATE resumes SET ${sets.join(", ")} WHERE id = ? AND user_id = ? RETURNING *`,
    args: [...args, id, userId],
  });
  return rs.rows[0] ? toResume(rs.rows[0]) : null;
}

export async function deleteResume(userId: string, id: string): Promise<boolean> {
  const db = await getDb();
  // Remove public links explicitly: SQLite only cascades when foreign_keys is enabled.
  await db.execute({ sql: "DELETE FROM resume_shares WHERE resume_id = ? AND user_id = ?", args: [id, userId] });
  const rs = await db.execute({
    sql: "DELETE FROM resumes WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return rs.rowsAffected > 0;
}
