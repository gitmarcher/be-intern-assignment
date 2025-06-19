import Joi from "joi";

const createPostSchema = Joi.object({
    content: Joi.string().required().min(2).messages({
        'string.empty': 'Content is required',
        'string.min': 'Content must be at least 2 characters long',
        'string.max': 'Content cannot exceed 5000 characters',
    }),
    hashtags: Joi.array().items(Joi.string().min(0).max(50)).messages({
        'array.base': 'Hashtags must be an array',
        'string.min': 'Each hashtag must be at least 1 character long',
        'string.max': 'Each hashtag cannot exceed 50 characters',
    }),
});


const searchByHashtagSchema = Joi.object({
    hashtag: Joi.string().required().min(1).max(50).messages({
        'string.empty': 'Hashtag is required',
        'string.min': 'Hashtag must be at least 1 character long',
        'string.max': 'Hashtag cannot exceed 50 characters',
    }),
});



export   {
  createPostSchema,
  searchByHashtagSchema,
};
