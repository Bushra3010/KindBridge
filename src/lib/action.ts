import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export type ActionState = { ok?: boolean; error?: string; message?: string } | null;

/** Runs a mutation and converts expected failures into a form-friendly state. */
export async function attempt(fn: () => Promise<unknown>, message?: string): Promise<ActionState> {
  try {
    await fn();
    return { ok: true, message };
  } catch (e) {
    if (e instanceof AppError) return { error: e.message };
    if (e instanceof ZodError) return { error: e.issues[0]?.message ?? "Please check the form." };
    console.error(e);
    return { error: "Something went wrong on our side. Nothing was changed. Please try again." };
  }
}
