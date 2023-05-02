import AppError from "../../errors/AppError";
import { createClient } from "redis";

interface Response { 
  days: boolean[]; 
  hours: string; 
  message: string; 
  useWorkTime: boolean;
}

const initialSettings = { 
  days: [false,false,false,false,false,false,false], 
  hours: "", 
  message: "", 
  useWorkTime: false 
};

const ListCompanySettingsService = async (
  companyId: number | string
): Promise<Response> => {
  let settings = null

  try {
      const client = createClient({
          url: process.env.REDIS_URL
      });

      client.on('error', err => console.log('Redis Client Error', err));
      await client.connect();

      settings = await client.get(`settings-${companyId}`);

      await client.disconnect();
  } catch (err: any) {
      throw new AppError(err);
  }

  if (!settings) settings = initialSettings;

  return JSON.parse(settings);
};

export default ListCompanySettingsService;
