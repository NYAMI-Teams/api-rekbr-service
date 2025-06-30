import redisClient from "../services/redisClient.js";
import throwError from "../utils/throwError.js";

const MAX_ATTEMPT = 5;

const loginLimiter = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next();

  const key = `login_attempts:${email}`;
  const attempts = parseInt((await redisClient.get(key)) || "0");

  if (attempts >= MAX_ATTEMPT) {
    throwError(
      "Terlalu banyak percobaan login gagal. Silakan coba lagi dalam 15 menit.",
      429
    );
  }

  req.loginLimiterKey = key;
  req.loginAttempts = attempts;

  next();
};

export default loginLimiter;
