import backService from "../services/bank.service.js";
import camelcaseKeys from "camelcase-keys";
import { resSuccess } from "../utils/response.js";

const getBanks = async (req, res) => {
  const result = await backService.listBanks();
  return resSuccess(res, "Daftar bank berhasil diambil", result, 200);
};

export default {
  getBanks,
};
