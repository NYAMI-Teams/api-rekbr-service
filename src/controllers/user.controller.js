import userService from "../services/user.service.js";
import resSuccess from "../utils/response.js";

const register = async (req, res) => {
  await userService.register(req.body);
  return resSuccess(
    res,
    200,
    "Register berhasil, silakan cek email untuk verifikasi akun Anda"
  );
};

const login = async (req, res) => {
  const result = await userService.login(req.body);
  return resSuccess(res, 200, "Login berhasil", result);
};

const resendVerifyEmail = async (req, res) => {
  await userService.resendVerifyEmail(req.body);
  return resSuccess(res, 200, "Berhasil resend verify email");
};

const verifyEmail = async (req, res) => {
  const result = await userService.verifyEmail(req.body);
  return resSuccess(res, 200, "Berhasil verifikasi email", result);
};

const verifyKyc = async (req, res) => {
  const userId = req.user.id;
  await userService.verifyKyc(userId);
  return resSuccess(res, 200, "Berhasil verifikasi KYC");
};

const getProfile = async (req, res) => {
  const userId = req.user.id;
  const user = await userService.getProfile(userId);
  return resSuccess(res, 200, "Berhasil mendapatkan profil", user);
};

const getEmail = async (req, res) => {
  const result = await userService.checkEmail(req.query);
  return resSuccess(res, 200, "Berhasil mendapatkan user", result);
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  await userService.changePassword(userId, oldPassword, newPassword);
  return resSuccess(res, 200, "Berhasil mengubah password");
};

const forgotPassword = async (req, res) => {
  await userService.forgotPassword(req.body.email);
  return resSuccess(res, 200, "OTP reset password berhasil dikirim ke email");
};

const verifyResetOtp = async (req, res) => {
  const { email, otpCode } = req.body;
  await userService.verifyResetOtp(email, otpCode);
  return resSuccess(res, 200, "OTP berhasil diverifikasi");
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  await userService.resetPassword(email, newPassword);
  return resSuccess(res, 200, "Password berhasil direset");
};

export default {
  register,
  login,
  resendVerifyEmail,
  verifyEmail,
  verifyKyc,
  getProfile,
  getEmail,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
