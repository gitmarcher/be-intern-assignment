import { Request, Response } from 'express';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (await this.userRepository.findOneBy({ email })) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      const user = this.userRepository.create(req.body);
      const result = await this.userRepository.save(user);

      const savedUser = Array.isArray(result) ? result[0] : result;
      const token = generateToken({ id: savedUser.id, email: savedUser.email });
      
              res.status(201).json({jwt_token:token, result: savedUser});
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken({ id: user.id, email: user.email });
      res.json({ jwt_token: token, user });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    const userId = req.user!.id;
  
    if (typeof userId !== 'number') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const result = await this.userRepository.delete(userId);
      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }
  

}
