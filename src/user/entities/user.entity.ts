export class User {
  id: number;
  name: string;
  email: string;
  role: string;
  password: string | undefined;
  verified: boolean;
  createdAt: Date;
}
