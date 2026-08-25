import { openDB } from "idb";

const DB_NAME = "yonkopa_offline_db";
const DB_VERSION = 3;
const STORE_NAME = "offline_auth";

const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 256;
const OFFLINE_DURATION =
  7 * 24 * 60 * 60 * 1000;

const dbPromise = openDB(
  DB_NAME,
  DB_VERSION,
  {
    upgrade(db) {
      if (
        !db.objectStoreNames.contains(
          STORE_NAME
        )
      ) {
        db.createObjectStore(
          STORE_NAME,
          {
            keyPath: "id",
          }
        );
      }
    },
  }
);

function arrayBufferToBase64(
  buffer
) {
  const bytes = new Uint8Array(
    buffer
  );

  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(
      byte
    );
  });

  return btoa(binary);
}

function base64ToArrayBuffer(
  base64
) {
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
}

function constantTimeEqual(
  a,
  b
) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

async function derivePasswordVerifier(
  password,
  salt
) {
  const encoder =
    new TextEncoder();

  const passwordKey =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      {
        name: "PBKDF2",
      },
      false,
      ["deriveBits"]
    );

  const derivedBits =
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations:
          PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      passwordKey,
      KEY_LENGTH
    );

  return new Uint8Array(
    derivedBits
  );
}

export async function saveOfflineAuth(
  user,
  password
) {
  if (
    !user ||
    !user.userId ||
    !password
  ) {
    throw new Error(
      "Invalid user or password for offline authentication."
    );
  }

  if (
    !window.crypto ||
    !window.crypto.subtle
  ) {
    throw new Error(
      "Web Crypto is not available on this device."
    );
  }

  const salt =
    crypto.getRandomValues(
      new Uint8Array(
        SALT_LENGTH
      )
    );

  const verifier =
    await derivePasswordVerifier(
      password,
      salt
    );

  const now = Date.now();

  const record = {
    id: "current_officer",

    userId: user.userId,

    full_name:
      user.full_name || "",

    email:
      user.email || "",

    phone:
      user.phone || "",

    role:
      user.role || "loan_officer",

    username:
      user.username ||
      user.user_name ||
      user.email ||
      "",

    salt: arrayBufferToBase64(
      salt
    ),

    verifier:
      arrayBufferToBase64(
        verifier
      ),

    iterations:
      PBKDF2_ITERATIONS,

    authenticatedAt: now,

    expiresAt:
      now +
      OFFLINE_DURATION,
  };

  const db =
    await dbPromise;

  await db.put(
    STORE_NAME,
    record
  );

  return record;
}

export async function verifyOfflinePassword(
  identifier,
  password
) {
  if (
    !identifier ||
    !password
  ) {
    return {
      success: false,
      message:
        "Username and password are required.",
    };
  }

  const db =
    await dbPromise;

  const record =
    await db.get(
      STORE_NAME,
      "current_officer"
    );

  if (!record) {
    return {
      success: false,
      message:
        "Offline access has not been enabled on this device. Please connect to the internet and log in first.",
    };
  }

  if (
    record.expiresAt &&
    Date.now() >
      record.expiresAt
  ) {
    await db.delete(
      STORE_NAME,
      "current_officer"
    );

    return {
      success: false,
      message:
        "Your offline access has expired. Please connect to the internet and log in again.",
    };
  }

  const enteredIdentifier =
    identifier
      .trim()
      .toLowerCase();

  const savedUsername =
    record.username
      ?.toString()
      .trim()
      .toLowerCase();

  const savedEmail =
    record.email
      ?.toString()
      .trim()
      .toLowerCase();

  if (
    enteredIdentifier !==
      savedUsername &&
    enteredIdentifier !==
      savedEmail
  ) {
    return {
      success: false,
      message:
        "Invalid username or email.",
    };
  }

  if (
    record.role
      ?.toString()
      .trim()
      .toLowerCase() !==
    "loan_officer"
  ) {
    return {
      success: false,
      message:
        "Offline access is only available for loan officers.",
    };
  }

  try {
    const salt =
      new Uint8Array(
        base64ToArrayBuffer(
          record.salt
        )
      );

    const storedVerifier =
      new Uint8Array(
        base64ToArrayBuffer(
          record.verifier
        )
      );

    const derivedVerifier =
      await derivePasswordVerifier(
        password,
        salt
      );

    const passwordMatches =
      constantTimeEqual(
        derivedVerifier,
        storedVerifier
      );

    if (
      !passwordMatches
    ) {
      return {
        success: false,
        message:
          "Invalid username or password.",
      };
    }

    return {
      success: true,
      user: {
        userId:
          record.userId,
        full_name:
          record.full_name,
        email:
          record.email,
        phone:
          record.phone,
        role:
          "loan_officer",
        username:
          record.username,
        offlineMode:
          true,
      },
      expiresAt:
        record.expiresAt,
    };
  } catch (error) {
    console.error(
      "Offline password verification failed:",
      error
    );

    return {
      success: false,
      message:
        "Unable to verify your offline credentials.",
    };
  }
}

export async function getOfflineAuth() {
  const db =
    await dbPromise;

  const record =
    await db.get(
      STORE_NAME,
      "current_officer"
    );

  if (!record) {
    return null;
  }

  if (
    record.expiresAt &&
    Date.now() >
      record.expiresAt
  ) {
    await db.delete(
      STORE_NAME,
      "current_officer"
    );

    return null;
  }

  return record;
}

export async function clearOfflineAuth() {
  const db =
    await dbPromise;

  await db.delete(
    STORE_NAME,
    "current_officer"
  );
}

export async function isOfflineAuthAvailable() {
  const record =
    await getOfflineAuth();

  return Boolean(record);
}