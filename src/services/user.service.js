import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from "./redisClient.js";
import userRepository from "../repositories/user.repository.js";
import throwError from "../utils/throwError.js";
import { sendOtpEmail } from "./email.service.js";

const generateAccessToken = async (user) => {
  const tokenId = Date.now().toString();
  const userId = user.id;
  const payload = { id: userId, tokenId, isAdmin: user.isAdmin };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });

  await redisClient.set(`access_token:${userId}`, tokenId, {
    EX: 30 * 24 * 60 * 60,
  }); // 30 hari
  const storedTokenId = await redisClient.get(`access_token:${userId}`);

  return token;
};

const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  await redisClient.set(user.id.toString(), refreshToken, {
    EX: 7 * 24 * 60 * 60, // 7 hari
  });

  return refreshToken;
};

const generateOtpCode = async (key) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.set(key, otpCode, { EX: 300 });
  return otpCode;
};

const requestVerifyEmail = async (email) => {
  const otpCode = await generateOtpCode("verifyEmail:" + email);
  await sendOtpEmail(email, otpCode, "verify");
};

const register = async ({ email, password }) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throwError("Email sudah terdaftar", 400);
  }

  const saltRounds = parseInt(process.env.SALT_ROUNDS);
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const user = {
    email,
    password: hashedPassword,
  };

  await redisClient.set("user:" + email, JSON.stringify(user), { EX: 3000 });

  requestVerifyEmail(email);
};

const login = async ({ email, password }) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throwError("email atau password salah", 400);
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    throwError("email atau password salah", 400);
  }
  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  const result = {
    accessToken,
    refreshToken,
    isAdmin: user.isAdmin,
  };

  return result;
};

const resendVerifyEmail = async ({ email }) => {
  const user = await redisClient.get("user:" + email);
  if (!user) {
    throwError("User tidak ditemukan", 404);
  }
  requestVerifyEmail(email);
};

const verifyEmail = async ({ email, otpCode }) => {
  const storedOtpCode = await redisClient.get("verifyEmail:" + email);
  if (!storedOtpCode || storedOtpCode !== otpCode) {
    throwError("Kode OTP tidak valid", 400);
  }

  const userFromRedis = await redisClient.get("user:" + email);
  if (!userFromRedis) {
    throwError("User tidak terdaftar", 404);
  }
  const userObj = JSON.parse(userFromRedis);

  const user = await userRepository.createUser({
    email: userObj.email,
    password: userObj.password,
  });

  await userRepository.updateUserStatus(email, "active");
  await redisClient.del("verifyEmail:" + email);
  await redisClient.del("user:" + email);

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  const result = {
    accessToken,
    refreshToken,
  };

  return result;
};

const verifyKyc = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throwError("User tidak ditemukan", 404);
  }
  if (user.kycStatus === "verified") {
    throwError("KYC sudah diverifikasi", 400);
  }
  await userRepository.updateUserKycStatus(userId, "verified");
};

const getProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throwError("User tidak ditemukan", 404);
  }

  delete user.id; // Hapus id dari response
  delete user.password; // Hapus password dari response

  return user;
};

const checkEmail = async ({ email }) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throwError("User tidak ditemukan", 400);
  }
  return {
    email: user.email,
    id: user.id,
  };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await userRepository.findUserById(userId);
  if (!user) throwError("User tidak ditemukan", 404);

  const isMatch = bcrypt.compareSync(oldPassword, user.password);
  if (!isMatch) throwError("Password lama salah", 400);

  if (oldPassword === newPassword) {
    throwError("Password baru tidak boleh sama dengan password lama", 400);
  }

  const saltRounds = parseInt(process.env.SALT_ROUNDS);
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

  await userRepository.updateUserPassword(userId, hashedNewPassword);
};

const forgotPassword = async (email) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) throwError("Email tidak ditemukan", 404);

  const otpCode = await generateOtpCode("resetPassword:" + email);
  await sendOtpEmail(email, otpCode, "reset");
};

const verifyOtpResetPassword = async (email, otpCode) => {
  const storedOtp = await redisClient.get("resetPassword:" + email);
  if (!storedOtp || storedOtp !== otpCode) {
    throwError("Kode OTP tidak valid atau sudah kadaluarsa", 400);
  }

  await redisClient.set("resetPassword:verified:" + email, "true", { EX: 600 });
  await redisClient.del("resetPassword:" + email);
};

const resetPassword = async (email, newPassword) => {
  const isVerified = await redisClient.get("resetPassword:verified:" + email);
  if (!isVerified) throwError("OTP belum diverifikasi", 400);

  const user = await userRepository.findUserByEmail(email);
  if (!user) throwError("User tidak ditemukan", 404);

  const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS));
  const hashedPassword = bcrypt.hashSync(newPassword, salt);

  await userRepository.updateUserPassword(user.id, hashedPassword);
  await redisClient.del("resetPassword:verified:" + email);
};

export default {
  register,
  login,
  resendVerifyEmail,
  verifyEmail,
  getProfile,
  verifyKyc,
  checkEmail,
  changePassword,
  forgotPassword,
  resendOtpResetPassword,
  verifyOtpResetPassword,
  resetPassword,
};
