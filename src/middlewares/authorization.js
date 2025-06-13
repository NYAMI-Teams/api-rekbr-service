import throwError from "../utils/throwError.js";

const authorization = (req, res, next) => {
    const isAdmin = req.user.isAdmin;

    if (!isAdmin) {
        throwError("access denied", 403);
    }
    next();
};

export default authorization;