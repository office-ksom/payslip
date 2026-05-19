const crypto = require('crypto');

async function verifyPassword(password, storedHash) {
  const [iterations, salt, hash] = storedHash.split('.');
  const key = crypto.pbkdf2Sync(
    password, 
    Buffer.from(salt, 'hex'), 
    parseInt(iterations), 
    32, 
    'sha256'
  );
  return key.toString('hex') === hash;
}

const stored = '100000.9bfcd4852e22ecfe2f377fa8c220b7bd.603009957e58ed07f0fa12c4abef7076b5693e2268f226a4f86391b06a9fb737';
verifyPassword('admin123', stored).then(res => console.log('Match:', res));
