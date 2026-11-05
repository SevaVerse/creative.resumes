import "server-only";
import { auth } from "@/auth";

/** Returns the signed-in user's id (from the Auth.js session cookie), or null. */
export async function getSessionUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}
