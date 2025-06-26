import { Expo } from "expo-server-sdk";
const expo = new Expo();

export const sendPushNotification = async (
  pushToken,
  { title, body, data = {} }
) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.warn("Token tidak valid:", pushToken);
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    const result = await expo.sendPushNotificationsAsync([message]);
    console.log("Notifikasi dikirim:", result);
  } catch (error) {
    console.error("Gagal mengirim notifikasi:", error);
  }
};
