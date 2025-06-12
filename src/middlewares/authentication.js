import jwt from "jsonwebtoken";
import throwError from "../utils/throwError.js";
import userRepository from "../repositories/user.repository.js";

const authentication = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            throwError("access denied", 40);
        }
        const decode = jwt.verify(accessToken, process.env.JWT_SECRET);

        console.log(decode, "=============> decode");

        const user = await userRepository.findUserById(decode.id);

        if (!user) {
            throwError("access denied", 401);
        }

        req.user = decode;
        next();
    } catch (error) {
        next(error);
    }
};

export default authentication;