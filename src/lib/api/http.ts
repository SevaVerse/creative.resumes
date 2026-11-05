import { NextResponse } from "next/server";

export function jsonError(status: number, error: string, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

/** Reads a JSON body while enforcing a byte limit (Content-Length is not trusted alone). */
export async function readJsonBody<T>(req: Request, maxBytes: number): Promise<T | null> {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > maxBytes) return null;
  const text = await req.text();
  if (new TextEncoder().encode(text).length > maxBytes) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
