import "server-only";
import { createClient as createWebClient, type Client } from "@libsql/client/web";
import { SCHEMA_STATEMENTS } from "./schema";
import { logger } from "@/utils/logger";

// Turso (libSQL) connection.
// - Production: TURSO_DATABASE_URL=libsql://<db>-<org>.turso.io + TURSO_AUTH_TOKEN.
//   Uses the HTTP ("web") client: no native binaries, ideal for serverless.
// - Local dev:  falls back to a SQLite file so no account is needed. The native
//   client is loaded at runtime only (hidden from the bundler, which cannot parse it).
const DEFAULT_LOCAL_URL = "file:./.data/securecv.db";

let ready: Promise<Client> | null = null;

async function createDbClient(): Promise<Client> {
  const url = process.env.TURSO_DATABASE_URL || DEFAULT_LOCAL_URL;
  if (!url.startsWith("file:")) {
    return createWebClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  if (process.env.NODE_ENV === "production") logger.warn("db.using_local_file", { url });
  const { mkdir } = await import("node:fs/promises");
  await mkdir(".data", { recursive: true });
  const nativeModule = "@libsql/client";
  const { createClient } = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ nativeModule)) as typeof import("@libsql/client");
  return createClient({ url });
}

async function ensureSchema(db: Client): Promise<void> {
  await db.batch(SCHEMA_STATEMENTS, "write");
}

/** Returns a ready-to-use client; schema is created idempotently once per process. */
export async function getDb(): Promise<Client> {
  if (!ready) {
    ready = (async () => {
      const db = await createDbClient();
      await ensureSchema(db);
      return db;
    })().catch((error) => {
      ready = null; // retry on next call
      throw error;
    });
  }
  return ready;
}

export function nowIso(): string {
  return new Date().toISOString();
}
