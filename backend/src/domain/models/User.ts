export interface UserData {
  id?: number;
  email: string;
  hashedPassword: string;
  role: string;
  createdAt?: Date | string;
}

export class User {
  id?: number;
  email: string;
  hashedPassword: string;
  role: string;
  createdAt: Date;

  constructor(data: UserData) {
    this.id = data.id;
    this.email = data.email;
    this.hashedPassword = data.hashedPassword;
    this.role = data.role;
    this.createdAt = data.createdAt ? new Date(data.createdAt as string) : new Date();
  }
}
