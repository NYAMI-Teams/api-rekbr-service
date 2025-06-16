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

export default { getAllUsers };
