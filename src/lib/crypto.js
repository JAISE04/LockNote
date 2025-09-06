const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function deriveKey(password, saltB64) {
  const salt = saltB64
    ? fromB64(saltB64)
    : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true, // <-- QUICK FIX: make the key extractable so exportKey() below works
    ["encrypt", "decrypt"]
  );

  return { key, saltB64: saltB64 || toB64(salt) };
}

async function hashKey(cryptoKey) {
  const raw = await crypto.subtle.exportKey("raw", cryptoKey); // now allowed
  const digest = await crypto.subtle.digest("SHA-256", raw);
  return toB64(digest);
}

export async function encryptText(plaintext, password) {
  const { key, saltB64 } = await deriveKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const passwordHash = await hashKey(key);
  return {
    encrypted_content: toB64(cipherBuf),
    iv: toB64(iv),
    salt: saltB64,
    password_hash: passwordHash,
  };
}

export async function decryptText(encryptedB64, password, saltB64, ivB64) {
  const { key } = await deriveKey(password, saltB64);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(ivB64) },
    key,
    fromB64(encryptedB64)
  );
  return dec.decode(plainBuf);
}

export async function derivePasswordHash(password, saltB64) {
  const { key } = await deriveKey(password, saltB64);
  return hashKey(key);
}
export async function passwordLookupHash(password) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(password));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}
