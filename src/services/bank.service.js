import bankRepo from "../repositories/bank.repository.js";
import { resSuccess } from "../utils/response.js";
import throwError from "../utils/throwError.js";

const listBanks = async () => {
  const banks = await bankRepo.getAllBanks();
  if (!banks || banks.length === 0) {
    return throwError("Tidak ada bank yang ditemukan", 400);
  }
  return banks;
};

export default {
  listBanks,
};
