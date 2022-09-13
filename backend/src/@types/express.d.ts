declare namespace Express {
  export interface Request {
    user: { id: string; profile: string, companyId: string | number };
    company: {id :string; profile: string};
  }
}
