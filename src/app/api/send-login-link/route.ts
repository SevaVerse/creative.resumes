import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { loginLimiter, buildKey } from "@/utils/rateLimit";

function html(loginLink: string) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html><html lang="en"><head><meta charset=\"UTF-8\" />
<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />
<title>Magic Login Link</title>
<style>a:hover{opacity:.92!important}@media (prefers-color-scheme:dark){body,.wrapper{background:#0d1117!important;color:#e6edf3!important}.card{background:#161b22!important;border-color:#30363d!important}.muted{color:#8b949e!important}.btn{background:#2563eb!important}}@media only screen and (max-width:520px){.card{padding:22px!important}h1{font-size:20px!important}}</style></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1f2937;line-height:1.5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 0;"><tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="wrapper" style="max-width:560px;margin:0 auto;"><tr><td>
<table width="100%" role="presentation" cellpadding="0" cellspacing="0" class="card" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;padding:32px;box-shadow:0 4px 12px -2px rgba(0,0,0,.05),0 2px 4px -2px rgba(0,0,0,.05);">
<tr><td style="text-align:center;padding-bottom:14px;">
<div style="display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;color:#111827;"><span style="display:inline-block;width:36px;height:36px;border-radius:12px;background:#2563eb;color:#fff;line-height:36px;font-weight:600;font-family:inherit;">RB</span>Resume Builder</div>
</td></tr>
<tr><td style="padding:2px 0 10px;"><h1 style="margin:0;font-size:22px;font-weight:600;color:#111827;letter-spacing:-.5px;">Your Magic Login Link</h1></td></tr>
<tr><td style="padding:4px 0 14px;font-size:15px;">Hi,<br/>Use the secure button below to continue your session.</td></tr>
<tr><td style="padding:8px 0 26px;text-align:center;"><a href="${loginLink}" class="btn" style="display:inline-block;background:#2563eb;color:#ffffff !important;text-decoration:none;font-weight:600;padding:15px 30px;border-radius:12px;font-size:15px;font-family:inherit;box-shadow:0 2px 4px rgba(0,0,0,.15);">Continue to Resume Builder</a></td></tr>
<tr><td style="font-size:13px;padding-bottom:10px;color:#374151;">If the button doesn’t work, copy this link:</td></tr>
<tr><td style="word-break:break-all;font-size:12px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:10px 12px;font-family:SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;color:#1f2937;">${loginLink}</td></tr>
<tr><td style="padding-top:18px;font-size:13px;color:#374151;">Privacy‑first: no persistent accounts, no trackers, no stored emails. Session ends when you close the tab—<strong>download your resume first.</strong></td></tr>
<tr><td style="padding-top:16px;font-size:12px;" class="muted">Didn’t request this? Ignore it—no one can use the link without your inbox.</td></tr>
<tr><td style="padding-top:22px;font-size:11px;line-height:1.4;color:#6b7280;" class="muted">© ${year} Resume Builder. Carbon‑aware, privacy‑first tools.</td></tr>
</table></td></tr></table></td></tr></table></body></html>`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  // Basic shape/size validation
  if (email.length > 254) {
    return NextResponse.json({ error: "Email too long" }, { status: 400 });
  }
  const key = buildKey(["login", ip, email.toLowerCase()]);
  const rl = loginLimiter.check(key);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests", retryAfterMs: rl.retryAfterMs }, { status: 429 });
  }
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: user && pass ? { user, pass } : undefined,
  });
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const loginLink = `${baseUrl}/?login=${encodeURIComponent(email)}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Resume Builder <no-reply@resumebuilder.local>",
    to: email,
    subject: "Your Secure Magic Login Link",
    text: `Resume Builder Login Link\n\nOpen this link to continue:\n${loginLink}\n\nWe do not persist accounts. Session ends when you close the browser tab—download your resume first. If you didn't request this, ignore it.`,
    html: html(loginLink),
  });
  return NextResponse.json({ success: true });
}