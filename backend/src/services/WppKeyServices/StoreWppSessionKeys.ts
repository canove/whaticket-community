import { BufferJSON } from "@whiskeysockets/baileys";

import WppKey from "../../models/WppKey.js";
import { setInRedis } from "../../libs/redisStore.js";
import { logger } from "../../utils/logger.js";

interface StoreKeyRequest {
  connectionId: number;
  deviceId: number;
  type: string;
  id: string;
  value: any;
}

const REDIS_KEY_TYPES = ["session", "sender-keys", "sender-key-memory"];

const StoreWppSessionKeys = async ({
  connectionId,
  deviceId,
  type,
  id,
  value
}: StoreKeyRequest): Promise<void> => {
  const valueJson = JSON.stringify(value, BufferJSON.replacer);

  if (REDIS_KEY_TYPES.includes(type)) {
    const redisKey = `wpp:${connectionId}:${deviceId}:${type}:${id}`;
    await setInRedis(redisKey, valueJson);

    return;
  }

  try {
    await WppKey.upsert(
      { connectionId, type, keyId: id, value: valueJson } as any,
      { conflictFields: ["connectionId", "type", "keyId"] as any }
    );
  } catch (err) {
    logger.error({
      info: "Error storing key in database",
      connectionId,
      type,
      keyId: id,
      err
    });
  }
};

export default StoreWppSessionKeys;
