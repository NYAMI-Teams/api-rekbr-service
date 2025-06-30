import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";

import { transactionQueue } from "../queues/transaction.queue.js";
import { complaintQueue } from "../queues/complaint.queue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(transactionQueue),
    new BullMQAdapter(complaintQueue),
  ],
  serverAdapter,
});

export default serverAdapter;
