import adminUserService from "../../services/admin/user.service.js";
import resSuccess from "../../utils/response.js";

const getAllUsers = async (req, res) => {
  const {
    search,
    kycStatus,
    createdFrom,
    createdTo,
    page = 1,
    limit = 10,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const { users, totalCount } = await adminUserService.getAllUsersForAdmin({
    search,
    kycStatus,
    createdFrom,
    createdTo,
    skip,
    take,
  });

  return resSuccess(res, 200, "Daftar user berhasil diambil", users, {
    page: Number(page),
    limit: Number(limit),
    totalCount,
  });
};

const getUserDetail = async (req, res) => {
  const { userId } = req.params;

  const user = await adminUserService.getUserDetailForAdmin(userId);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }
  console.log("💬 user:", user);

  return resSuccess(res, 200, "Detail user berhasil diambil", user);
};

export default { getAllUsers, getUserDetail };
