// SQLite / libSQL (Turso) schema for SecureCV.
// Kept dependency-free so it can also be imported by scripts run with
// `node --experimental-strip-types` (see scripts/migrate-from-supabase.ts).
//
// Access control that Supabase RLS used to provide is now enforced in the
// server-side repositories (every resume query is scoped by user_id).

export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    image TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`,
  `CREATE TABLE IF NOT EXISTS accounts (
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (provider, provider_account_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`,
  `CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template TEXT NOT NULL,
    data TEXT NOT NULL,
    last_edited_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_resumes_user_edited ON resumes(user_id, last_edited_at DESC)`,
  // Opt-in public links to a resume (/r/<id>). Always created and revoked by the owner (user_id).
  `CREATE TABLE IF NOT EXISTS resume_shares (
    id TEXT PRIMARY KEY,
    resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    indexable INTEGER NOT NULL DEFAULT 0,
    hide_contact INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_resume_shares_resume ON resume_shares(user_id, resume_id)`,
  `CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event_type TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type)`,
  `CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    location TEXT,
    sector TEXT NOT NULL CHECK (sector IN ('government', 'private')),
    source TEXT NOT NULL,
    url TEXT NOT NULL,
    summary TEXT,
    employment_type TEXT,
    posted_at TEXT,
    last_date TEXT,
    tags TEXT,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_sector_seen ON jobs(sector, first_seen_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_last_seen ON jobs(last_seen_at)`,
  // Shared rate-limit windows (src/lib/db/rateLimits.ts). `key` is an HMAC, never a raw IP or user id;
  // rows are deleted after expires_at.
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    window_start INTEGER NOT NULL,
    hits INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at)`,
  `CREATE TABLE IF NOT EXISTS job_runs (
    id TEXT PRIMARY KEY,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    stats TEXT
  )`,
];
