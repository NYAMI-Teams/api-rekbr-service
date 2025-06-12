import backService from "../services/bank.service.js";
import resSuccess from "../utils/response.js";

const getBanks = async (req, res) => {
  const result = await backService.listBanks();
  return resSuccess(res, 200, "Daftar bank berhasil diambil", result);
};

export default {
  getBanks,
};
