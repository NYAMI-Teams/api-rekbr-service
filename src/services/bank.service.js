import bankRepo from "../repositories/bank.repository.js";
import throwError from "../utils/throwError.js";

const listBanks = async () => {
  const banks = await bankRepo.getAllBanks();
  if (!banks || banks.length === 0) {
    return throwError("Tidak ada bank yang ditemukan", 400);
  }
  return banks;
};

const getDummyAccount = async ({ account_number, bank_id }) => {
  const accounts = await bankRepo.getDummyAccount(account_number, bank_id);
  if (!accounts || accounts.length === 0) {
    return throwError("Tidak ada akun dummy yang ditemukan", 404);
  }

  return accounts;
};

const saveAccount = async ({
  user_id,
  bank_id,
  account_number,
  account_holder_name,
}) => {
  const bank = await bankRepo.findBank(bank_id);
  if (!bank) {
    return throwError("Bank tidak ditemukan", 404);
  }

  const existingAccount = await bankRepo.findAccount({
    user_id,
    bank_id,
    account_number,
  });
  if (existingAccount) {
    return {
      alreadyExists: true,
      message: "Akun sudah ada",
      data: existingAccount,
    };
  }

  const newAccount = await bankRepo.createAccount({
    user_id,
    bank_id,
    account_number,
    account_holder_name,
  });
  return {
    message: "Akun berhasil disimpan",
    data: newAccount,
  };
};

const showAccount = async (user_id) => {
  const accounts = await bankRepo.getAccounts(user_id);
  if (!accounts || accounts.length === 0) {
    return throwError("Tidak ada akun yang ditemukan", 404);
  }
  return accounts;
};

export default {
  listBanks,
  getDummyAccount,
  saveAccount,
  showAccount,
};
