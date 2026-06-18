import nodemailer from "nodemailer";
import mailgen from "mailgen";

export const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagelink.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mail = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      "Email service failed siliently. Make sure that you have provided your MAILTRAP credentials in the .env file",
    );
    console.error("Error: ", error);
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

export const emailVerificationTemplate = (username, verificationUrl) => ({
  subject: "Verify your Project Camp email",
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2>Welcome to Project Camp, ${username}!</h2>
      <p>Please verify your email address by clicking the button below.
         This link expires in <strong>24 hours</strong>.</p>
      <a href="${verificationUrl}"
         style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;
                border-radius:6px;text-decoration:none;font-weight:600">
        Verify Email
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:13px">
        Or copy this URL into your browser:<br/>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </p>
    </div>
  `,
});

export const forgotPasswordTemplate = (username, resetUrl) => ({
  subject: "Reset your Project Camp password",
  html: `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2>Password Reset Request</h2>
      <p>Hi ${username},</p>
      <p>Someone requested a password reset for your Project Camp account.
         Click the button below to reset it. This link expires in <strong>24 hours</strong>.</p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:12px 24px;background:#DC2626;color:#fff;
                border-radius:6px;text-decoration:none;font-weight:600">
        Reset Password
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:13px">
        If you did not request this, you can safely ignore this email.<br/>
        Or copy this URL into your browser:<br/>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
    </div>
  `,
});
