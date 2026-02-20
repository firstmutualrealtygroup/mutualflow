import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.log("[Email] SMTP not configured — email not sent:", subject, "to:", to);
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"First Mutual Realty Group" <${process.env.SMTP_FROM ?? user}>`,
    to,
    subject,
    html,
  });

  return { success: true, simulated: false };
}
