import userRepo from "../../repositories/user.repository.js";

const getAllUsersForAdmin = async (filters) => {
  const { users, totalCount } = await userRepo.getAllUsers(filters);

  const formatted = users.map((user) => ({
    id: user.id,
    email: user.email,
    status: user.status,
    kycStatus: user.kyc_status,
    isAdmin: user.is_admin,
    createdAt: user.created_at,
  }));

  return { users: formatted, totalCount };
};

export default { getAllUsersForAdmin };
