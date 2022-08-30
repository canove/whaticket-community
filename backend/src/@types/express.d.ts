declare namespace Express {
  export interface Request {
    user: { id: string; profile: string };
    company: {id :string; profile: string};
  }
}
