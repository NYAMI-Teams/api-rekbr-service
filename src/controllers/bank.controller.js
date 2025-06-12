import backService from "../services/bank.service.js";
import camelcaseKeys from "camelcase-keys";
import { resSuccess } from "../utils/response.js";

const getBanks = async (req, res) => {
  const result = await backService.listBanks();
  return resSuccess(res, "Daftar bank berhasil diambil", result, 200);
};

const getDummyAccount = async (req, res) => {
  const {account_number, bank_id} = req.query;
  const result = await backService.getDummyAccount({account_number, bank_id});
  return resSuccess(res, "Akun dummy berhasil diambil", result, 200);
}

export default {
  getBanks,
  getDummyAccount,
};
