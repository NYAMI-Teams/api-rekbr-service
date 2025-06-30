import rateLimit from "express-rate-limit";

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Terlalu banyak permintaan, coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default apiRateLimiter;
