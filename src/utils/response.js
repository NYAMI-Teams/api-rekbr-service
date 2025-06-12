export const resSuccess = (res, message, data=null, statusCode=200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
