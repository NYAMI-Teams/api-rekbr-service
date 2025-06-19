import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const generateOtpTemplate = ({ title, description, otpCode }) => {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Rekbr App</h1>
      </div>
      <div style="padding: 30px; color: #333;">
        <h2 style="margin-top: 0;">${title}</h2>
        <p>${description}</p>
        <div style="font-size: 28px; font-weight: bold; background-color: #f0f0f0; padding: 12px 20px; text-align: center; letter-spacing: 4px; border-radius: 6px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 14px; color: #666;">Kode ini akan kedaluwarsa dalam 5 menit. Jangan berikan kode ini ke siapa pun.</p>
      </div>
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #aaa;">
        &copy; ${new Date().getFullYear()} Rekbr App. All rights reserved.
      </div>
    </div>
  </div>
  `;
};

export const sendOtpEmail = async (to, otpCode, type = "verify") => {
  let subject = "";
  let title = "";
  let description = "";

  if (type === "verify") {
    subject = "Kode OTP Verifikasi Email";
    title = "Verifikasi Email Kamu";
    description = "Gunakan kode berikut untuk memverifikasi akun kamu:";
  } else if (type === "reset") {
    subject = "Kode OTP Reset Password";
    title = "Reset Password Akun Kamu";
    description = "Gunakan kode berikut untuk mereset password akun kamu:";
  } else {
    subject = "Kode OTP";
    title = "Kode OTP Kamu";
    description = "Gunakan kode berikut untuk melanjutkan:";
  }

  const mailOptions = {
    from: `"Rekbr App" <${process.env.BREVO_SENDER}>`,
    to,
    subject,
    html: generateOtpTemplate({ title, description, otpCode }),
  };

  await transporter.sendMail(mailOptions);
};
