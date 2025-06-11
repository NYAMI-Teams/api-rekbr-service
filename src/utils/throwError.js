class AppError extends Error {
  constructor(message, statusCode, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const throwError = (message, statusCode = 500, errors = null) => {
  throw new AppError(message, statusCode, errors);
};

module.exports = throwError;
