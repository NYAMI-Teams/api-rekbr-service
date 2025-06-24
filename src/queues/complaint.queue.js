import { Queue } from "bullmq";
import redisClient from "../services/redisClient.js";

export const complaintQueue = new Queue("complaint-queue", {
  connection: redisClient.options,
});
