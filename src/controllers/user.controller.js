import userService from "../services/user.service.js";
import resSuccess from "../utils/response.js";
import { sendOtpEmail } from '../services/email.service.js';

const register = async (req, res) => {
  await userService.register(req.body);
  return resSuccess(res, 200, "Register berhasil, silakan cek email untuk verifikasi akun Anda");
};

const login = async (req, res) => {
  const result = await userService.login(req.body);
  return resSuccess(res, 200, "Login berhasil", result);
}

const resendVerifyEmail = async (req, res) => {
  await userService.resendVerifyEmail(req.body);
  return resSuccess(res, 200, "Berhasil resend verify email");
};

const verifyEmail = async (req, res) => {
  const result = await userService.verifyEmail(req.body);
  return resSuccess(res, 200, "Berhasil verifikasi email");
}

export default {
  register,
  login,
  resendVerifyEmail,
  verifyEmail,
};
