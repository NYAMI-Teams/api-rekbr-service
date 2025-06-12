import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // contoh: your@gmail.com
    pass: process.env.EMAIL_PASS,       // gunakan App Password jika pakai Gmail
  },
});

export const sendOtpEmail = async (to, otpCode) => {
  const mailOptions = {
    from: `"rekbr-app" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otpCode}`,
    html: `<p>Your OTP code is: <b>${otpCode}</b></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to', to);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send email');
  }
};
