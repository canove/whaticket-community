declare namespace Express {
  export interface Request {
    user: { id: string; profile: string };
  }
}
