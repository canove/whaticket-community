declare namespace Express {
  export interface Request {
    user: { id: string; profile: number, companyId: number };
  }
}
