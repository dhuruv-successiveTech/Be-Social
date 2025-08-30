class CustomError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  }
}

class ValidationError extends CustomError {
  constructor(errors) {
    super('Validation Error', 400, errors);
  }
}

class AuthenticationError extends CustomError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends CustomError {
  constructor(message = 'Not authorized to perform this action') {
    super(message, 403);
  }
}

class NotFoundError extends CustomError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

const errorMessages = {
  username: {
    required: 'Username is required',
    min: 'Username must be at least 3 characters long',
    max: 'Username cannot exceed 30 characters',
    pattern: 'Username can only contain letters, numbers and underscores',
    unique: 'This username is already taken'
  },
  email: {
    required: 'Email is required',
    invalid: 'Please provide a valid email address',
    unique: 'This email is already registered'
  },
  password: {
    required: 'Password is required',
    min: 'Password must be at least 8 characters long',
    pattern: 'Password must contain uppercase, lowercase, number and special character'
  },
  post: {
    content: {
      max: 'Post content cannot exceed 500 characters'
    },
    media: {
      max: 'Maximum 10 media files allowed'
    }
  },
  comment: {
    content: {
      required: 'Comment content is required',
      max: 'Comment cannot exceed 200 characters'
    }
  }
};

module.exports = {
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  errorMessages
};
