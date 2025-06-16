import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redisClient from './redisClient.js';
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

  await redisClient.set(`access_token:${userId}`, tokenId, { EX: 900 }); 
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

  sendOtpEmail(email, otpCode);
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
  }

  return result;
}

const resendVerifyEmail = async ({ email }) => {
  const user = await redisClient.get("user:" + email);
  if (!user) {
    throwError("User tidak ditemukan", 404);
  }
  const otpCode = await generateOtpCode("verifyEmail:" + email);

  sendOtpEmail(email, otpCode);
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

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  const result = {
    accessToken,
    refreshToken,
  }

  return result;
}

const verifyKyc = async ({ fullname, birthDate, lastEducation, province, city, businessField }) => {
  const userId = req.user.id;
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throwError("User tidak ditemukan", 404);
  }
  if (user.kycStatus === "verified") {
    throwError("KYC sudah diverifikasi", 400);
  }
  const updatedUser = await userRepository.updateUserKycStatus(userId, {
    kycStatus: "verified",
  });
}

const getProfile = async (userId) => {
  console.log(userId, "=====>");
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throwError("User tidak ditemukan", 404);
  }
  return user;
}

const checkEmail = async ({ email}) => {
  const user = await userRepository.findUserByEmail(email);
  
  if (!user) {
    throwError("User tidak ditemukan", 400);
  }
  return {
    email: user.email,
    id: user.id,
  };
}


export default {
  register,
  login,
  resendVerifyEmail,
  verifyEmail,
  getProfile,
  verifyKyc,
  checkEmail,
};
