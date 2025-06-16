import prisma from "../prisma/client.js";
import toCamelCase from "../utils/camelCaseResponse.js";

const createUser = async ({ email, password, isAdmin = false, status = "inactive", kycStatus = "unverified" }) => {
  return await prisma.user.create({
    data: {
      email,
      password,
      is_admin: isAdmin,
      status,
      kyc_status: kycStatus,
    },
  });
};

const findUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    omit: {
      // password: true, // Omit password from the respon
    },
  });
  return user ? toCamelCase(user) : null;
}

const findUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      id: true, // Omit id from the response
      password: true, // Omit password from the response
    },
  });
  return user ? toCamelCase(user) : null;
}

const updateUserStatus = async (email, status) => {
  return await prisma.user.update({
    where: { email },
    data: { status },
  });
}

const updateUserKycStatus = async (userId, kycStatus) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { kyc_status: kycStatus },
  });
}


export default {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserStatus,
  updateUserKycStatus,
};