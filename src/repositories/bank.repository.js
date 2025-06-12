import camelcaseKeys from "camelcase-keys";
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

const getDummyAccount = async (account_number, bank_id) => {
  const accounts = await prisma.dummyAccount.findMany({
    where: {
      account_number,
      bank_id
    }, 
    select: {
      id: true,
      bank_id: true,
      account_number: true, // Fixed the missing value
    },
  });

  return accounts.map(account => toCamelCase(account));
};

export default {
  getAllBanks,
  getDummyAccount,
};
