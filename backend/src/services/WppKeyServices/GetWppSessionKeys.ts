import { BufferJSON } from "@whiskeysockets/baileys";

import WppKey from "../../models/WppKey.js";
import { getFromRedis } from "../../libs/redisStore.js";
import { logger } from "../../utils/logger.js";

interface GetKeysRequest {
  connectionId: number;
  deviceId: number;
  type: string;
  ids: string[];
}

const REDIS_KEY_TYPES = ["session", "sender-keys", "sender-key-memory"];

const GetWppSessionKeys = async ({
  connectionId,
  deviceId,
  type,
  ids
}: GetKeysRequest): Promise<any> => {
  const data: any = {};

  if (REDIS_KEY_TYPES.includes(type)) {
    await Promise.all(
      ids.map(async id => {
        const key = `wpp:${connectionId}:${deviceId}:${type}:${id}`;
        const stored = await getFromRedis(key);

        if (stored) {
          data[id] = JSON.parse(stored, BufferJSON.reviver);
        }
      })
    );

    return data;
  }

  try {
    await Promise.all(
      ids.map(async id => {
        const keyRecord = await WppKey.findOne({
          where: {
            connectionId,
            type,
            keyId: id
          }
        });

        if (keyRecord) {
          data[id] = JSON.parse(keyRecord.value, BufferJSON.reviver);
        }
      })
    );
  } catch (err) {
    logger.error({
      info: "Error getting keys from database",
      connectionId,
      type,
      err
    });
  }

  return data;
};

export default GetWppSessionKeys;
