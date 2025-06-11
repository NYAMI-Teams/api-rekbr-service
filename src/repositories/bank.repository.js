const prisma = require("../prisma/client");

const getAllBanks = () => {
  return prisma.bankList.findMany({
    select: {
      id: true,
      logo_url: true,
      bank_name: true,
    },
  });
};

module.exports = {
  getAllBanks,
};
