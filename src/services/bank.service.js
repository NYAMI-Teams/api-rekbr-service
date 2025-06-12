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

const getDummyAccount = async ({account_number, bank_id}) => {
  const accounts = await bankRepo.getDummyAccount(account_number, bank_id);
  if (!accounts || accounts.length === 0) {
    return throwError("Tidak ada akun dummy yang ditemukan", 404);
  }

  return accounts;
}

export default {
  listBanks,
  getDummyAccount,
};
