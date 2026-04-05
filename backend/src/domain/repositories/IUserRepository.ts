import { User } from '../models/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  updatePassword(userId: number, hashedPassword: string): Promise<void>;
}
