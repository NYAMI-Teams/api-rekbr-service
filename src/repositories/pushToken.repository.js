import prisma from "../prisma/client.js";

const updatePushToken = async (userId, token) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { push_token: token },
  });
};

const findUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { push_token: true },
  });
};

export default { updatePushToken, findUserById };
