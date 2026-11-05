// One-time migration: copies profiles, resumes and analytics from Supabase into Turso.
//
// Usage (Node 22+):
//   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
//   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
//   node --experimental-strip-types scripts/migrate-from-supabase.ts [--dry-run]
//
// Users keep their Supabase UUID as the new user id. On their first sign-in with
// Google/GitHub, Auth.js links the OAuth account to that user by email, so saved
// resumes reappear automatically. Safe to re-run (INSERT OR IGNORE).
import { createClient } from "@libsql/client";
import { SCHEMA_STATEMENTS } from "../src/lib/db/schema.ts";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const PAGE = 1000;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!process.env.TURSO_DATABASE_URL && !DRY_RUN) {
  console.error("Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) or pass --dry-run");
  process.exit(1);
}

type Rec = Record<string, unknown>;

async function fetchAll(table: string, select = "*"): Promise<Rec[]> {
  const rows: Rec[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}&order=created_at.asc`, {
      headers: {
        apikey: SERVICE_KEY!,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Range: `${offset}-${offset + PAGE - 1}`,
        "Range-Unit": "items",
      },
    });
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status} ${await res.text()}`);
    const page = (await res.json()) as Rec[];
    rows.push(...page);
    if (page.length < PAGE) return rows;
  }
}

const str = (v: unknown) => (v === null || v === undefined || v === "" ? null : String(v));
const json = (v: unknown) => (v === null || v === undefined ? null : JSON.stringify(v));

async function main() {
  const [profiles, resumes, analytics] = await Promise.all([
    fetchAll("profiles"),
    fetchAll("resumes"),
    fetchAll("analytics"),
  ]);
  console.log(`Fetched ${profiles.length} profiles, ${resumes.length} resumes, ${analytics.length} analytics events`);
  if (DRY_RUN) return;

  const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
  await db.batch(SCHEMA_STATEMENTS, "write");

  const userStatements = profiles.map((p) => ({
    sql: "INSERT OR IGNORE INTO users (id, email, name, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [String(p.id), str(p.email)?.toLowerCase() ?? null, str(p.full_name), str(p.avatar_url), str(p.created_at) ?? new Date().toISOString(), str(p.updated_at) ?? new Date().toISOString()],
  }));
  const knownUsers = new Set(profiles.map((p) => String(p.id)));
  const resumeStatements = resumes
    .filter((r) => knownUsers.has(String(r.user_id)))
    .map((r) => ({
      sql: "INSERT OR IGNORE INTO resumes (id, user_id, name, template, data, last_edited_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [String(r.id), String(r.user_id), String(r.name), String(r.template), json(r.data) ?? "{}", str(r.last_edited_at) ?? str(r.created_at), str(r.created_at)],
    }));
  const analyticsStatements = analytics.map((a) => ({
    sql: "INSERT OR IGNORE INTO analytics (id, user_id, event_type, metadata, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [String(a.id), str(a.user_id), String(a.event_type), json(a.metadata), str(a.created_at)],
  }));

  for (const [label, stmts] of [["users", userStatements], ["resumes", resumeStatements], ["analytics", analyticsStatements]] as const) {
    for (let i = 0; i < stmts.length; i += 200) await db.batch(stmts.slice(i, i + 200), "write");
    console.log(`Imported ${stmts.length} ${label}`);
  }
  const skipped = resumes.length - resumeStatements.length;
  if (skipped) console.warn(`Skipped ${skipped} resumes whose user had no profile row`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
