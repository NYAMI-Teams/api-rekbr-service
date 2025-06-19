import SibApiV3Sdk from "sib-api-v3-sdk";

const sendOtpEmail = async (to, otpCode, type = "verify") => {
  const subject =
    type === "reset" ? "Kode OTP Reset Password" : "Kode OTP Verifikasi Email";

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKey = SibApiV3Sdk.ApiClient.instance.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const sender = {
    email: "noreply@farinojoshua.com",
    name: "Rekbr App",
  };

  const htmlContent = `
    <p>Halo,</p>
    <p>Kode OTP kamu adalah:</p>
    <h2 style="letter-spacing: 4px;">${otpCode}</h2>
    <p>Kode ini akan kedaluwarsa dalam 5 menit.</p>
  `;

  const sendSmtpEmail = {
    sender,
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email terkirim ke", to);
  } catch (err) {
    console.error("Gagal kirim email:", err.message);
    throw new Error("Gagal mengirim email OTP");
  }
};

export { sendOtpEmail };
