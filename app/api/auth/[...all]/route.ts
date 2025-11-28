import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Added social provider env vars (Google, GitHub credentials)
export const { POST, GET } = toNextJsHandler(auth);