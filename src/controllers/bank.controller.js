const bankService = require("../services/bank.service");
const { resSuccess } = require("../utils/response");

const getBanks = async (req, res) => {
  const banks = await bankService.listBanks();
  return resSuccess(res, "Daftar bank berhasil diambil", banks, 200);
};

module.exports = {
  getBanks,
};
