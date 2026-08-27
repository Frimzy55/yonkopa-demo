import { openDB } from "idb";

const DB_NAME = "yonkopa_offline_db";
const DB_VERSION = 4;

const AUTH_STORE = "offline_auth";

const OFFLINE_AUTH_EXPIRY_DAYS = 7;

const OFFLINE_AUTH_EXPIRY_MS =
  OFFLINE_AUTH_EXPIRY_DAYS *
  24 *
  60 *
  60 *
  1000;

const dbPromise = openDB(
  DB_NAME,
  DB_VERSION,
  {
    upgrade(db) {
      if (
        !db.objectStoreNames.contains(
          AUTH_STORE
        )
      ) {
        db.createObjectStore(
          AUTH_STORE,
          {
            keyPath: "identifier",
          }
        );
      }

      if (
        !db.objectStoreNames.contains(
          "drafts"
        )
      ) {
        db.createObjectStore(
          "drafts",
          {
            keyPath: "draftUuid",
          }
        );
      }
    },
  }
);

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

  const bytes = new Uint8Array(
    binary.length
  );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {
    bytes[i] =
      binary.charCodeAt(i);
  }

  return bytes.buffer;
};

const generateSalt = () => {
  const salt = new Uint8Array(16);

  crypto.getRandomValues(salt);

  return salt;
};

const deriveVerifier = async (
  password,
  salt
) => {
  const encoder =
    new TextEncoder();

  const passwordKey =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

  const derivedBits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 150000,
        hash: "SHA-256",
      },
      passwordKey,
      256
    );

  return bufferToBase64(
    derivedBits
  );
};

export const saveOfflineCredentials =
  async ({
    identifier,
    password,
    user,
  }) => {
    if (
      !identifier ||
      !password ||
      !user
    ) {
      throw new Error(
        "Invalid offline authentication data."
      );
    }

    const normalizedIdentifier =
      identifier
        .trim()
        .toLowerCase();

    const salt =
      generateSalt();

    const verifier =
      await deriveVerifier(
        password,
        salt
      );

    const now = Date.now();

    const expiresAt =
      now +
      OFFLINE_AUTH_EXPIRY_MS;

    const db =
      await dbPromise;

    await db.put(
      AUTH_STORE,
      {
        identifier:
          normalizedIdentifier,

        verifier,

        salt:
          bufferToBase64(
            salt
          ),

        user,

        createdAt: now,

        lastOnlineLogin: now,

        expiresAt,
      }
    );
  };

export const verifyOfflineCredentials =
  async ({
    identifier,
    password,
  }) => {
    if (
      !identifier ||
      !password
    ) {
      return null;
    }

    const normalizedIdentifier =
      identifier
        .trim()
        .toLowerCase();

    const db =
      await dbPromise;

    const record =
      await db.get(
        AUTH_STORE,
        normalizedIdentifier
      );

    if (!record) {
      return null;
    }

    /*
     * Records created by an older
     * version don't have expiresAt.
     * They must authenticate online
     * again to renew offline access.
     */
    if (
      !record.expiresAt ||
      Date.now() >=
        record.expiresAt
    ) {
      await db.delete(
        AUTH_STORE,
        normalizedIdentifier
      );

      throw new Error(
        "Offline access has expired. Please connect to the internet and log in online again."
      );
    }

    const salt =
      new Uint8Array(
        base64ToBuffer(
          record.salt
        )
      );

    const verifier =
      await deriveVerifier(
        password,
        salt
      );

    if (
      verifier !==
      record.verifier
    ) {
      return null;
    }

    return record;
  };

export const hasOfflineCredentials =
  async (identifier) => {
    if (!identifier) {
      return false;
    }

    const normalizedIdentifier =
      identifier
        .trim()
        .toLowerCase();

    const db =
      await dbPromise;

    const record =
      await db.get(
        AUTH_STORE,
        normalizedIdentifier
      );

    if (!record) {
      return false;
    }

    if (
      !record.expiresAt ||
      Date.now() >=
        record.expiresAt
    ) {
      await db.delete(
        AUTH_STORE,
        normalizedIdentifier
      );

      return false;
    }

    return true;
  };

export const removeOfflineCredentials =
  async (identifier) => {
    if (!identifier) {
      return;
    }

    const normalizedIdentifier =
      identifier
        .trim()
        .toLowerCase();

    const db =
      await dbPromise;

    await db.delete(
      AUTH_STORE,
      normalizedIdentifier
    );
  };

export const getOfflineAuthStatus =
  async (identifier) => {
    if (!identifier) {
      return null;
    }

    const normalizedIdentifier =
      identifier
        .trim()
        .toLowerCase();

    const db =
      await dbPromise;

    const record =
      await db.get(
        AUTH_STORE,
        normalizedIdentifier
      );

    if (!record) {
      return null;
    }

    const now =
      Date.now();

    if (
      !record.expiresAt ||
      now >=
        record.expiresAt
    ) {
      await db.delete(
        AUTH_STORE,
        normalizedIdentifier
      );

      return {
        available: false,
        expired: true,
        expiresAt:
          record.expiresAt ||
          null,
      };
    }

    return {
      available: true,
      expired: false,
      createdAt:
        record.createdAt,
      lastOnlineLogin:
        record.lastOnlineLogin,
      expiresAt:
        record.expiresAt,
      remainingMs:
        record.expiresAt -
        now,
      remainingDays:
        Math.ceil(
          (record.expiresAt -
            now) /
            (24 *
              60 *
              60 *
              1000)
        ),
    };
  };