import pushTokenService from "../services/pushToken.service.js";
import resSuccess from "../utils/response.js";

const savePushToken = async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  if (!token) {
    throw new Error("Token tidak boleh kosong");
  }

  await pushTokenService.saveUserPushToken(userId, token);

  return resSuccess(res, 200, "Token push berhasil disimpan", {
    userId,
    token,
  });
};

export default { savePushToken };
