/**
 * Secure password hashing using PBKDF2 (Web Crypto API)
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256 // 32 bytes
  );

  const hashArray = new Uint8Array(hashBuffer);
  
  // Format: iterations.salt_hex.hash_hex
  return `100000.${bufToHex(salt)}.${bufToHex(hashArray)}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  
  try {
    const [iterationsStr, saltHex, hashHex] = storedHash.split(".");
    const iterations = parseInt(iterationsStr);
    const salt = hexToBuf(saltHex);
    const storedHashBuf = hexToBuf(hashHex);
    
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    
    const currentHashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const currentHashArray = new Uint8Array(currentHashBuffer);
    
    return timingSafeEqual(currentHashArray, storedHashBuf);
  } catch (err) {
    console.error("Verification error:", err);
    return false;
  }
}

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
