import AppError from "../../errors/AppError";
import { createClient } from "redis";

interface Response { 
  days: boolean[]; 
  hours: string; 
  message: string; 
  useWorkTime: boolean;
  allowedIPs: string[];
  transferRequiredQueue: boolean;
}

const initialSettings = { 
  days: [false,false,false,false,false,false,false], 
  hours: "", 
  message: "", 
  useWorkTime: false,
  allowedIPs: [],
  transferRequiredQueue: false,
  defaultSurvey: ""
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

      const redisSettings = await client.get(`settings-${companyId}`);
      settings = { ...initialSettings, ...JSON.parse(redisSettings) };

      await client.disconnect();
  } catch (err: any) {
      throw new AppError(err);
  }

  if (!settings) return initialSettings;

  return typeof settings == 'object'? settings: JSON.parse(settings);
};

export default ListCompanySettingsService;
