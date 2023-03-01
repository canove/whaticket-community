declare namespace Express {
  export interface Request {
    user: { id: string | number; profile: number, companyId: number };
  }
}
