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

const saveAccount = async ({user_id, bank_id, account_number, account_holder_name}) => {
  const existingAccount = await bankRepo.findAccount({user_id, bank_id, account_number});
  if (existingAccount) {
    return {
      alreadyExists: true,
      message: "Akun sudah ada",
      data: existingAccount
    };
  }

  const newAccount = await bankRepo.createAccount({user_id, bank_id, account_number, account_holder_name});
  return newAccount;
}

export default {
  listBanks,
  getDummyAccount,
  saveAccount,
};
