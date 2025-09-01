const Joi = require('joi');


const userValidationSchema = {
  signup: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .regex(/^[a-zA-Z0-9_]+$/)
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers and underscores',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password'
      }),
    fullName: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 50 characters',
        'any.required': 'Full name is required'
      }),
    bio: Joi.string()
      .max(160)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Bio cannot exceed 160 characters'
      }),
    avatar: Joi.string().uri().allow('').optional()
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  })
};

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedBody = await schema.validateAsync(req.body, { abortEarly: false });
      req.validatedBody = validatedBody;
      next();
    } catch (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
  };
};

module.exports = {
  validateSignup: validateRequest(userValidationSchema.signup),
  validateLogin: validateRequest(userValidationSchema.login)
};
