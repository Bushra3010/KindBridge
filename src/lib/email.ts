import "server-only";
import { AppError } from "@/lib/errors";

// Transactional email through Resend's REST API (https://resend.com/docs/api-reference/emails/send-email).
// Without RESEND_API_KEY, development prints emails to the server console;
// production refuses to pretend an email was sent.

type Email = { to: string; subject: string; text: string; html: string };

export async function sendEmail(e: Email) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") throw new AppError("Email isn't configured yet. Please try again later.");
    console.log(`\n[email → ${e.to}] ${e.subject}\n${e.text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "KindBridge <noreply@kindbridge.co.in>", to: [e.to], subject: e.subject, text: e.text, html: e.html }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    throw new AppError("We couldn't send the email just now. Please try again in a minute.");
  }
}

export function verificationEmail(to: string, code: string, minutes: number): Email {
  return {
    to,
    subject: `${code} is your KindBridge code`,
    text: `Your KindBridge verification code is ${code}.\n\nIt expires in ${minutes} minutes. If you didn't sign up for KindBridge, you can ignore this email.`,
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#13293d">
  <p style="font-size:18px;font-weight:700;margin:0 0 16px">Verify your email</p>
  <p style="margin:0 0 16px">Enter this code in KindBridge to finish signing up:</p>
  <p style="font-size:32px;font-weight:800;letter-spacing:8px;margin:0 0 16px;padding:16px;background:#eef6f8;border-radius:16px;text-align:center">${code}</p>
  <p style="font-size:13px;color:#5b6b78;margin:0">It expires in ${minutes} minutes. If you didn't sign up for KindBridge, you can ignore this email.</p>
</div>`,
  };
}
