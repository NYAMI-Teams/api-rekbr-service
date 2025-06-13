const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Prisma invalid argument error
  if (
    message.includes("Invalid `prisma.user.findUnique()` invocation") ||
    message.includes("Invalid value provided")
  ) {
    statusCode = 400;
    message = "Bad Request";
  }

  const response = {
    success: false,
    message,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
