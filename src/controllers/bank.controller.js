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

const saveAccount = async (req, res) => {
  const {user_id, bank_id, account_number, account_holder_name} = req.body;
  const result = await backService.saveAccount({user_id, bank_id, account_number, account_holder_name});
  if (result.alreadyExists) {
    return resSuccess(res, result.message, result.data, 200);
  }
  return resSuccess(res, "Akun berhasil disimpan", result, 201);
}

export default {
  getBanks,
  getDummyAccount,
  saveAccount,
};
