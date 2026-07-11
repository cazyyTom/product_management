import nodemailer from "nodemailer";
import Mailgen from "mailgen";

// ─── Send Email ───────────────────────────────────────────────────────────────
export const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Product Basecamp",
      link: process.env.CLIENT_URL || "http://localhost:3000",
    },
  });

  // options.mailgenContent is a proper Mailgen body object
  const emailHtml = mailGenerator.generate(options.mailgenContent);
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mail = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: emailHtml,
    text: emailTextual,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      "Email service failed silently. Make sure you have provided your SMTP credentials in the .env file",
    );
    console.error("Error: ", error);
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────
// Each template returns { subject, mailgenContent }
// mailgenContent is passed directly to mailGenerator.generate()

export const emailVerificationMailgenContent = (username, verificationUrl) => ({
  subject: "Verify your Product Basecamp email",
  mailgenContent: {
    body: {
      name: username,
      intro: "Welcome to Product Basecamp! We're excited to have you on board.",
      action: {
        instructions:
          "Please click the button below to verify your email address. This link expires in 24 hours.",
        button: {
          color: "#4F46E5",
          text: "Verify Email",
          link: verificationUrl,
        },
      },
      outro:
        "If you didn't create a Product Basecamp account, you can safely ignore this email.",
    },
  },
});

export const forgotPasswordTemplate = (username, resetUrl) => ({
  subject: "Reset your Product Basecamp password",
  mailgenContent: {
    body: {
      name: username,
      intro:
        "You have received this email because a password reset request was made for your account.",
      action: {
        instructions:
          "Click the button below to reset your password. This link expires in 24 hours.",
        button: {
          color: "#DC2626",
          text: "Reset Password",
          link: resetUrl,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required. Your account is safe.",
    },
  },
});
