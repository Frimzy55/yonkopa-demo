import { openDB } from "idb";

const DB_NAME = "yonkopa_offline_db";
const DB_VERSION = 2;
const STORE_NAME = "offline_auth";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "identifier" });
    }
  },
});

const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const base64ToBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};

const generateSalt = () => {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
};

const deriveVerifier = async (password, salt) => {
  const encoder = new TextEncoder();

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 150000,
      hash: "SHA-256",
    },
    passwordKey,
    256
  );

  return bufferToBase64(derivedBits);
};

export const saveOfflineCredentials = async ({
  identifier,
  password,
  user,
}) => {
  if (!identifier || !password || !user) {
    throw new Error("Invalid offline authentication data.");
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const salt = generateSalt();

  const verifier = await deriveVerifier(password, salt);

  const db = await dbPromise;

  await db.put(STORE_NAME, {
    identifier: normalizedIdentifier,
    verifier,
    salt: bufferToBase64(salt),
    user,
    createdAt: Date.now(),
    lastOnlineLogin: Date.now(),
  });
};

export const verifyOfflineCredentials = async ({
  identifier,
  password,
}) => {
  if (!identifier || !password) {
    return null;
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();
  const db = await dbPromise;

  const record = await db.get(STORE_NAME, normalizedIdentifier);

  if (!record) {
    return null;
  }

  const salt = new Uint8Array(base64ToBuffer(record.salt));

  const verifier = await deriveVerifier(password, salt);

  if (verifier !== record.verifier) {
    return null;
  }

  return record;
};

export const hasOfflineCredentials = async (identifier) => {
  if (!identifier) {
    return false;
  }

  const db = await dbPromise;

  const record = await db.get(
    STORE_NAME,
    identifier.trim().toLowerCase()
  );

  return Boolean(record);
};

export const removeOfflineCredentials = async (identifier) => {
  if (!identifier) {
    return;
  }

  const db = await dbPromise;

  await db.delete(
    STORE_NAME,
    identifier.trim().toLowerCase()
  );
};