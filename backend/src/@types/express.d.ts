declare module "express-serve-static-core" {
  interface Request {
    user: {
      id: string;
      profile: string;
      tenantId: number;
    };
    tenantId: number;
    tenant?: any;
  }
}

export {};
