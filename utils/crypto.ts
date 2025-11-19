import CryptoJS from 'crypto-js';

function randomUUID() {
  const chars = [
    ...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ];
  const uuid = Array.from({ length: 36 });
  let rnd = 0;
  let r: number;
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid[i] = '-';
    } else if (i === 14) {
      uuid[i] = '4';
    } else {
      if (rnd <= 0x02)
        rnd = Math.trunc(0x2_00_00_00 + Math.random() * 0x1_00_00_00);
      r = rnd & 16;
      rnd = rnd >> 4;
      uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('').replace(/-/g, '').toLowerCase();
}

/**
 * Randomly generate aes key
 *
 * @returns aes key
 */
export function generateAesKey() {
  return CryptoJS.enc.Utf8.parse(randomUUID());
}

/**
 * base64 encoding
 * @param str
 * @returns base64 string
 */
export function encryptBase64(str: CryptoJS.lib.WordArray) {
  return CryptoJS.enc.Base64.stringify(str);
}

/**
 * Encrypt with AES (ECB/Pkcs7)
 * @param message Content to encrypt
 * @param aesKey aesKey
 * @returns encrypted string
 */
export function encryptWithAes(
  message: string,
  aesKey: CryptoJS.lib.WordArray,
) {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

/**
 * Decrypt base64
 */
export function decryptBase64(str: string) {
  return CryptoJS.enc.Base64.parse(str);
}

/**
 * Decrypt with AES
 */
export function decryptWithAes(
  message: string,
  aesKey: CryptoJS.lib.WordArray,
) {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}