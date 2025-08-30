const createResponse = (success, message, data = null, errors = []) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data) {
    response.data = data;
  }

  if (errors.length > 0) {
    response.errors = errors;
  }

  return response;
};

const successResponse = (message, data) => {
  return createResponse(true, message, data);
};

const errorResponse = (message, errors = []) => {
  return createResponse(false, message, null, errors);
};

module.exports = {
  successResponse,
  errorResponse
};
