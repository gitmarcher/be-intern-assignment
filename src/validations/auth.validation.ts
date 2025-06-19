import Joi from "joi";

const createUserSchema = Joi.object({
    firstName: Joi.string().required().min(2).max(255).messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 255 characters",
    }),
      lastName: Joi.string().required().min(2).max(255).messages({
          "string.empty": "Last name is required",
          "string.min": "Last name must be at least 2 characters long",
          "string.max": "Last name cannot exceed 255 characters",
      }),
      email: Joi.string().required().email().max(255).messages({
          "string.empty": "Email is required",
          "string.email": "Please provide a valid email address",
          "string.max": "Email cannot exceed 255 characters",
      }),
      password: Joi.string().required().min(8).max(16).messages({
          "string.empty": "Password is required",
          "string.min": "Password must be at least 8 characters long",
          "string.max": "Password cannot exceed 255 characters",
      }),
  });
  
const loginUserSchema = Joi.object({
  email: Joi.string().required().email().max(255).messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email cannot exceed 255 characters',
  }),
  password: Joi.string().required().min(8).max(16).messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 16 characters',
  }),
});

export {  
    createUserSchema,
    loginUserSchema,
};