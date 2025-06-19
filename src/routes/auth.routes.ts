import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { AuthController } from '../controllers/auth.controller';
import { createUserSchema, loginUserSchema } from '../validations/auth.validation';
import { authenticateToken } from '../middleware/auth.middleware';


export const authRouter = Router();
const authController = new AuthController();

authRouter.post('/register', validate(createUserSchema), authController.createUser.bind(authController));

authRouter.post('/login', validate(loginUserSchema), authController.loginUser.bind(authController));

authRouter.delete('/',authenticateToken, authController.deleteUser.bind(authController));