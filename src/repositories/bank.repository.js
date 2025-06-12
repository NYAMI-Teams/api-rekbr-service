import prisma from "../prisma/client.js";
import toCamelCase from "../utils/camelCaseResponse.js";

const getAllBanks = async () => {
  const banks = await prisma.bankList.findMany({
    select: {
      id: true,
      logo_url: true,
      bank_name: true,
    },
  });

  return banks.map(bank => toCamelCase(bank));
};

export default {
  getAllBanks,
};
