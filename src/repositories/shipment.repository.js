import prisma from "../prisma/client.js";

const createShipment = async ({
  transactionId,
  courierId,
  trackingNumber,
  photoUrl,
}) => {
  return await prisma.shipment.create({
    data: {
      transaction_id: transactionId,
      courier_id: courierId,
      tracking_number: trackingNumber,
      shipment_date: new Date(),
      photo_url: photoUrl,
    },
  });
};

const getCourier = async () => {
  return await prisma.courierList.findMany({
    orderBy: { name: "asc"},
    select: {
      id: true,
      name: true,
    }
  })
}

export default {
  createShipment,
  getCourier,
};
