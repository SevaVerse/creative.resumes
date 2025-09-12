// filepath: c:\workspace\os\v1\resume_v4\src\app\api\send-login-link\route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

    // Configure Nodemailer (Mailtrap Sandbox by default)
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

  // Example login link (replace with your logic)
  const loginLink = `http://localhost:3000/?login=${encodeURIComponent(email)}`;

await transporter.sendMail({
    from: process.env.SMTP_FROM || 'resumebuilder@example.com',
    to: email,
    subject: "Your Secure Login Link for Resume Builder",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #222;">
            <h2 style="color: #2563eb;">Welcome to Resume Builder!</h2>
            <p>Hi there,</p>
            <p>
                You requested a secure, one-time login link to access your Resume Builder account.
            </p>
            <p>
                <a href="${loginLink}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; border-radius: 6px; text-decoration: none; font-weight: bold;">
                    Click here to log in
                </a>
            </p>
            <p style="font-size: 0.95em; color: #555;">
                If you did not request this link, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="font-size: 0.85em; color: #888;">
                This link will expire soon for your security.<br>
                Need help? Reply to this email.
            </p>
        </div>
    `,
});

  return NextResponse.json({ success: true });
}