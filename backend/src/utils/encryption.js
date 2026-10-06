const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.EVIDENCE_ENCRYPTION_KEY || '', 'base64');

if (key.length !== 32) {
    throw new Error('EVIDENCE_ENCRYPTION_KEY deve ser uma chave base64 de 32 bytes.');
}

const encrypt = (value) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted.toString('base64')}`;
};

const decrypt = (value) => {
    const [ivValue, authTagValue, encryptedValue] = value.split('.');
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(ivValue, 'base64')
    );
    decipher.setAuthTag(Buffer.from(authTagValue, 'base64'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedValue, 'base64')),
        decipher.final(),
    ]);
    return JSON.parse(decrypted.toString('utf8'));
};

module.exports = { encrypt, decrypt };
