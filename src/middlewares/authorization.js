import throwError from "../utils/throwError.js";

const authorization = (req, res, next) => {
    const role = req.user.role;
    console.log(role);
    if (role !== "admin") {
        throwError("access denied", 403);
    }
    next();
};

export default authorization;