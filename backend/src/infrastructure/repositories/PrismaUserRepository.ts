import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, UserData } from '../../domain/models/User';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    if (!record) return null;
    return new User(record as UserData);
  }

  async findById(id: number): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return new User(record as UserData);
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });
  }
}
