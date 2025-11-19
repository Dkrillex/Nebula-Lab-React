// RSA加密工具
// 密钥对生成 http://web.chacuo.net/netrsakeypair
import JSEncrypt from 'jsencrypt';
import { RSA_PUBLIC_KEY, RSA_PRIVATE_KEY } from '../constants';

/**
 * 使用RSA公钥加密（用于请求加密）
 * @param txt 需要加密的数据
 * @returns 加密后的数据
 */
export function encrypt(txt: string): string | false {
  if (!RSA_PUBLIC_KEY) {
    console.warn('RSA公钥未配置');
    return false;
  }
  const instance = new JSEncrypt();
  instance.setPublicKey(RSA_PUBLIC_KEY);
  return instance.encrypt(txt);
}

/**
 * 使用RSA私钥解密（用于响应解密）
 * @param txt 需要解密的数据
 * @returns 解密后的数据
 */
export function decrypt(txt: string): string | false {
  if (!RSA_PRIVATE_KEY) {
    console.warn('RSA私钥未配置');
    return false;
  }
  const instance = new JSEncrypt();
  instance.setPrivateKey(RSA_PRIVATE_KEY);
  return instance.decrypt(txt);
}

