import nodemailer from "nodemailer";

const host = process.env.MAILTRAP_HOST;
const port = Number(process.env.MAILTRAP_PORT);
const user = process.env.MAILTRAP_USER;
const password = process.env.MAILTRAP_PASSWORD;

if (!host || !port || !user || !password) {
  throw new Error("Mailtrap environment variables are missing");
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass: password,
  },
});

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
) {
  return transporter.sendMail({
    from: {
      name: "Finova",
      address: "hello@finova.test",
    },
    to: email,
    subject: "Verify your Finova email",
    text: `Welcome to Finova! Verify your email using this link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Welcome to Finova!</h2>
        <p>Thanks for creating your Finova account.</p>
        <p>Click the button below to verify your email address.</p>
        <a
          href="${verificationUrl}"
          style="display: inline-block; padding: 12px 20px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px;"
        >
          Verify Email
        </a>
        <p>This link will expire after 30 minutes.</p>
        <p>If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  });
}