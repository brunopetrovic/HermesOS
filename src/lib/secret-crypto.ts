import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import os from 'node:os';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_BYTES = 32;
const SCRYPT_SALT = 'unox-connection-secret-v1';

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;
  const envKey = process.env.UNOX_SECRET_KEY;
  if (envKey) {
    cachedKey = scryptSync(envKey, SCRYPT_SALT, KEY_BYTES);
    return cachedKey;
  }
  const host = os.hostname() + os.userInfo().username + os.homedir();
  cachedKey = scryptSync(host, SCRYPT_SALT, KEY_BYTES);
  return cachedKey;
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return '';
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptSecret(payload: string | undefined | null): string {
  if (!payload) return '';
  if (!payload.startsWith('enc:')) return payload;
  const parts = payload.split(':');
  if (parts.length !== 4) return '';
  const [, ivB64, tagB64, dataB64] = parts;
  try {
    const key = getKey();
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    return '';
  }
}
