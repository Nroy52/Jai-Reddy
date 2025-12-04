/**
 * Web Crypto API utilities for AES-GCM encryption/decryption
 * Used for Password Manager feature with session-based passcode
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Derive a CryptoKey from a passcode using PBKDF2
 */
async function deriveKey(passcode: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext using AES-GCM with session passcode
 * Returns base64-encoded: salt(16) + iv(12) + ciphertext
 */
export async function encryptPassword(plaintext: string, passcode: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(plaintext);

  // Generate random salt and IV
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from passcode
  const key = await deriveKey(passcode, salt.buffer);

  // Encrypt
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt ciphertext using AES-GCM with session passcode
 * Input is base64-encoded: salt(16) + iv(12) + ciphertext
 */
export async function decryptPassword(encryptedBase64: string, passcode: string): Promise<string> {
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // Extract salt, iv, ciphertext
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

  // Derive key from passcode
  const key = await deriveKey(passcode, salt.buffer);

  // Decrypt
  try {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    throw new Error('Decryption failed - incorrect passcode or corrupted data');
  }
}

/**
 * Validate that a passcode can decrypt an encrypted value
 */
export async function validatePasscode(encryptedBase64: string, passcode: string): Promise<boolean> {
  try {
    await decryptPassword(encryptedBase64, passcode);
    return true;
  } catch {
    return false;
  }
}
