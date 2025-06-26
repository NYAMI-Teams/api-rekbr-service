import pushTokenRepository from "../repositories/pushToken.repository.js";

const saveUserPushToken = async (userId, token) => {
  return await pushTokenRepository.updatePushToken(userId, token);
};

const getPushTokenByUserId = async (userId) => {
  const user = await pushTokenRepository.findUserById(userId);
  return user?.push_token || null;
};

export default { saveUserPushToken, getPushTokenByUserId };
