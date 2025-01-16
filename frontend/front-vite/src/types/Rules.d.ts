export interface IRules {
  user: {
    static: string[];,
    dynamic: string[];
  };
  admin: {
    static: string[];
    dynamic: {
      [key: string]: (data: any) => boolean; 
    }
  };
}