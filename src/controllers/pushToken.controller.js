import pushTokenService from "../services/pushToken.service.js";

const savePushToken = async (req, res) => {
  const userId = req.user.id;
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token tidak boleh kosong" });
  }

  await pushTokenService.saveUserPushToken(userId, token);

  res
    .status(200)
    .json({ success: true, message: "Push token berhasil disimpan" });
};

export default { savePushToken };
