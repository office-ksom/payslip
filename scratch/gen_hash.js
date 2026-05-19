// This is a scratch script to generate a password hash for the migration
// Run with node or just use the logic
const crypto = require('crypto');

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const iterations = 100000;
  
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, 32, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      const saltHex = salt.toString('hex');
      const hashHex = derivedKey.toString('hex');
      resolve(`${iterations}.${saltHex}.${hashHex}`);
    });
  });
}

hashPassword('admin123').then(console.log);
