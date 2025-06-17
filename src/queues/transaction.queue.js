import { Queue } from "bullmq";
import redisClient from "../services/redisClient.js";

export const transactionQueue = new Queue("transaction-queue", {
  connection: redisClient.options,
});
