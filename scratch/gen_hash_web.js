const { webcrypto } = require('crypto');

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  
  const hashBuffer = await webcrypto.subtle.deriveBits(
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
  
  const bufToHex = (buf) => Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `100000.${bufToHex(salt)}.${bufToHex(hashArray)}`;
}

hashPassword('admin123').then(hash => console.log(hash));
