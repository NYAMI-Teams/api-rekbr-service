import SibApiV3Sdk from "sib-api-v3-sdk";

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

const sendOtpEmail = async (to, otpCode, type = "verify") => {
  const subject =
    type === "reset" ? "Kode OTP Reset Password" : "Kode OTP Verifikasi Email";
  const title =
    type === "reset" ? "Reset Password Akun Kamu" : "Verifikasi Email Kamu";
  const description =
    type === "reset"
      ? "Gunakan kode berikut untuk mereset password akun kamu:"
      : "Gunakan kode berikut untuk memverifikasi akun kamu:";

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = SibApiV3Sdk.ApiClient.instance.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const sender = {
    email: "noreply@farinojoshua.com", // harus verified di Brevo
    name: "Rekbr App",
  };

  const htmlContent = generateOtpTemplate({ title, description, otpCode });

  const sendSmtpEmail = {
    sender,
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email terkirim ke", to);
  } catch (err) {
    console.error("❌ Gagal kirim email:", err.message);
    throw new Error("Gagal mengirim email OTP");
  }
};

export { sendOtpEmail };
