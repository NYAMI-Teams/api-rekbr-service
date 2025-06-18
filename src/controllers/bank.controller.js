import backService from "../services/bank.service.js";
import resSuccess from "../utils/response.js";

const getBanks = async (req, res) => {
  const result = await backService.listBanks();
  return resSuccess(res, 200, "Daftar bank berhasil diambil", result);
};

const getDummyAccount = async (req, res) => {
  const { account_number, bank_id } = req.query;
  const result = await backService.getDummyAccount({ account_number, bank_id });
  return resSuccess(res, 200, "Akun dummy berhasil diambil", result);
};

const postAccount = async (req, res) => {
  const user_id = req.user.id;
  const { bank_id, account_number, account_holder_name } = req.body;
  const result = await backService.saveAccount({
    user_id,
    bank_id,
    account_number,
    account_holder_name,
  });
  if (result.alreadyExists) {
    return resSuccess(res, 200, result.message, result.data);
  }
  return resSuccess(res, 201, "Akun berhasil disimpan", result);
};

const getAccounts = async (req, res) => {
  console.log("getAccounts called with query:", req.query);
  const user_id = req.user.id;
  const result = await backService.showAccount(user_id);
  return resSuccess(res, 200, "Daftar akun berhasil diambil", result);
};

export default {
  getBanks,
  getDummyAccount,
  postAccount,
  getAccounts,
};
