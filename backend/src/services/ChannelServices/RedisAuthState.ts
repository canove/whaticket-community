import {
  initAuthCreds,
  BufferJSON,
  proto,
  AuthenticationCreds,
  SignalDataTypeMap
} from "@whiskeysockets/baileys";
import { createClient } from "redis";
import { logger } from "../../utils/logger.js";

export const useRedisAuthState = async (redisClient: ReturnType<typeof createClient>, keyPrefix: string) => {
  const writeData = async (data: any, key: string) => {
    try {
      await redisClient.set(key, JSON.stringify(data, BufferJSON.replacer));
    } catch (error) {
      logger.error({ error }, "Error writing redis auth state");
    }
  };

  const readData = async (key: string) => {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return JSON.parse(data, BufferJSON.reviver);
      }
      return null;
    } catch (error) {
      logger.error({ error }, "Error reading redis auth state");
      return null;
    }
  };

  const removeData = async (key: string) => {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error({ error }, "Error removing redis auth state");
    }
  };

  const creds: AuthenticationCreds = (await readData(`${keyPrefix}creds`)) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: { [key: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async id => {
              let value = await readData(`${keyPrefix}${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${keyPrefix}${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => {
      return writeData(creds, `${keyPrefix}creds`);
    }
  };
};
