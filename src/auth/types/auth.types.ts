export interface JwtPayload {
  userId: string; // User ID
  email: string;
}

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}
