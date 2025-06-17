import jwt from "jsonwebtoken";
import throwError from "../utils/throwError.js";
import userRepository from "../repositories/user.repository.js";
import redisClient from "../services/redisClient.js";

const authentication = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throwError("Access denied: No token provided", 401);
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const { id, tokenId, isAdmin } = decoded;
    // const storedTokenId = await redisClient.get(`access_token:${id}`);
    // if (!storedTokenId || storedTokenId !== tokenId) {
    //     throwError("Access denied: Invalid or expired token", 401);
    // }

    const user = await userRepository.findUserById(id);
    if (!user) {
      throwError("Access denied: User not found", 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export default authentication;
