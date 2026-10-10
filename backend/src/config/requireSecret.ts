const hasRepeatingPattern = (value: Buffer): boolean => {
  for (let length = 1; length <= value.length / 2; length += 1) {
    let repeats = true;
    for (let index = length; index < value.length; index += 1) {
      if (value[index] !== value[index % length]) {
        repeats = false;
        break;
      }
    }
    if (repeats) return true;
  }
  return false;
};

export const getSecretBytes = (
  name: string,
  value: string | undefined
): Buffer => {
  if (!value) {
    throw new Error(
      `${name} must be set to a 32-byte random secret encoded as hex or base64`
    );
  }

  let bytes: Buffer;
  if (/^[a-f\d]{64}$/i.test(value)) {
    bytes = Buffer.from(value, "hex");
  } else if (/^[A-Za-z\d+/]{43}=$/.test(value)) {
    bytes = Buffer.from(value, "base64");
    if (bytes.toString("base64") !== value) bytes = Buffer.alloc(0);
  } else {
    bytes = Buffer.alloc(0);
  }

  if (
    bytes.length !== 32 ||
    new Set(bytes).size < 12 ||
    hasRepeatingPattern(bytes)
  ) {
    throw new Error(
      `${name} must be set to a 32-byte random secret encoded as hex or base64`
    );
  }

  return bytes;
};

const requireSecret = (name: string, value: string | undefined): string => {
  getSecretBytes(name, value);
  return value as string;
};

export default requireSecret;
