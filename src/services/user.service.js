import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from './redisClient.js';
import userRepository from "../repositories/user.repository.js";
import throwError from "../utils/throwError.js";
import { sendOtpEmail } from "./email.service.js";


const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
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
  await redisClient.set(key, otpCode, { EX: 3000 });
  return otpCode;
}

const register = async ({ email, password }) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throwError("Email sudah terdaftar", 400);
  }

  const saltRounds = parseInt(process.env.SALT_ROUNDS);
  const salt = bcrypt.genSaltSync(saltRounds)
  const hashedPassword = bcrypt.hashSync(password, salt)

  const user = {
    email,
    password: hashedPassword,
  }

  await redisClient.set("user:" + email, JSON.stringify(user), { EX: 3000 });

  const otpCode = await generateOtpCode("verifyEmail:" + email);

  await sendOtpEmail(email, otpCode);
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
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  const result = {
    accessToken,
    refreshToken,
  }

  return result;
}

const resendVerifyEmail = async ({ email }) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throwError("User tidak ditemukan", 404);
  }
  if (user.status === "active") {
    throwError("Email sudah diverifikasi", 400);
  }
  const otpCode = await generateOtpCode("verifyEmail:" + email);

  await sendOtpEmail(email, otpCode);
}

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
    password: userObj.password
  });

  await userRepository.updateUserStatus(email, "active");
  await redisClient.del("verifyEmail:" + email);
  await redisClient.del("user:" + email);

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  const result = {
    accessToken,
    refreshToken,
  }

  return result;
}

const getProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throwError("User tidak ditemukan", 404);
  }
  return user;
}

export default {
  register,
  login,
  resendVerifyEmail,
  verifyEmail,
  getProfile,
};
