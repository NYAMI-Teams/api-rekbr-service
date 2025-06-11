const bankRepo = require("../repositories/bank.repository");

const listBanks = async () => {
  const banks = await bankRepo.getAllBanks();
  return banks.map((bank) => ({
    bankId: bank.id,
    logoUrl: bank.logo_url,
    bankName: bank.bank_name,
  }));
};

module.exports = {
  listBanks,
};
