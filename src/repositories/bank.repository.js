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
      account_number: true,
    },
  });

  return accounts.map(account => toCamelCase(account));
};

const findAccount = async ({user_id, bank_id, account_number}) => {
  const existing = await prisma.bankAccount.findFirst({
    where: {
      user_id,
      bank_id,
      account_number,
    },
  })

  return existing ? toCamelCase(existing) : null;
}

const createAccount = async ({user_id, bank_id, account_number, account_name}) => {
  const newAccount = await prisma.bankAccount.create({
    data: {
      user_id,
      bank_id,
      account_number,
      account_holder_name: account_name,
    },
  });

  return toCamelCase(newAccount);
};


export default {
  getAllBanks,
  getDummyAccount,
  findAccount,
  createAccount,
};
