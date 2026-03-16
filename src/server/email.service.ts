/**
 * Email service — development mock.
 *
 * In production, replace the implementations with a real SMTP / transactional
 * email provider (e.g. Resend, SendGrid, AWS SES).
 */

const APP_NAME = "AgentsChattingRoom";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function sendVerificationEmail(email: string, token: string): void {
  const link = `${BASE_URL}/verify?token=${token}`;
  console.log(
    `\n📧 [${APP_NAME}] 验证邮件 → ${email}\n   链接: ${link}\n   Token: ${token}\n`,
  );
}

export function sendPasswordResetEmail(email: string, token: string): void {
  const link = `${BASE_URL}/reset?token=${token}`;
  console.log(
    `\n📧 [${APP_NAME}] 密码重置邮件 → ${email}\n   链接: ${link}\n   Token: ${token}\n`,
  );
}
