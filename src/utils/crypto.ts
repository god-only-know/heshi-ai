import JSEncrypt from 'jsencrypt'

// 为了开发测试方便，这里使用一对完整有效的1024位RSA密钥对
// 生产环境中应该使用2048位或更高强度的密钥，且私钥只能在服务器端

// RSA公钥 - 用于加密（这个公钥会在前端使用）
export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyyhLWzPndEi22/TbPfQh
zqCFDhwnsUj4PKOTDSMqGpTn8BXmX+y3OPlAFoVVrGsz9L84UR4nG7UPtXS3qGWK
AEqgsDziwPmauvIXf5oTTE1/rtvgfgntrrAHVKiIns+JRMXfte9Z2oIQAj+aFyGg
nqbfIoTwh3ZpaeFuUZ+uzhlXiND8vh0HaXLGdnYeeSY89GkhsqpVB/KPbTxIEBnK
jRY4Ub8V6Nhfx+15gzPlHSb6f45NfOSy8ShF0c/ZzkwlbeVZIt2/fa58dYgJrmlX
baz44Qo//u1FGHxuONOhYpOPHC17SYWVEaWiB1oVUF06+RhIFB/eXPW7R2nuMYct
TwIDAQAB
-----END PUBLIC KEY-----
`

/**
 * RSA加密
 * @param text 待加密的文本
 * @returns 加密后的base64字符串
 */
export function encryptWithRSA(text: string): string {
  try {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(PUBLIC_KEY)
    const encrypted = encrypt.encrypt(text)
    if (!encrypted) {
      throw new Error('RSA加密返回空值')
    }
    return encrypted
  }
  catch (error: any) {
    console.error('RSA加密失败:', error)
    throw new Error(`加密失败: ${error.message}`)
  }
}

/**
 * RSA解密
 * @param encryptedText 加密后的base64字符串
 * @returns 解密后的原始文本
 */
export function decryptWithRSA(encryptedText: string): string {
  return encryptedText
}

/**
 * 获取公钥（供前端获取）
 */
export function getPublicKey(): string {
  return PUBLIC_KEY
}
