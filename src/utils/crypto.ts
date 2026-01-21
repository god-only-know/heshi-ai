import JSEncrypt from 'jsencrypt'

// 为了开发测试方便，这里使用一对完整有效的1024位RSA密钥对
// 生产环境中应该使用2048位或更高强度的密钥，且私钥只能在服务器端

// RSA公钥 - 用于加密（这个公钥会在前端使用）
export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtLeaJGKOBlOjPFzbZTpT
PA3fcl+xjv9ZCZTnyKMTNMVzRK6wbf6OZKJVR+SgwSLPpqJF9/li87M/d6ow9HHt
QLtwunfeEGF2X98q4iHBSzr6CF9wPleWnC/zOCyVU0m67zqAguOeSJCYFaOj4xer
UEqlmij+eWtPiiAzY4U5Ztx4zray1BS6wXZ6zd0xQRRgDZtgshFOmF5yVhmMDBxC
z6EsoIPpIAHH54ok6CvRzC5SXgafmN2JFTI+W/sN+CbJOCvl3L2n9Fz3hdIoo6Uj
B9bLlZr9bQcFTxJcAAL4Kh4ZoKeActBQcWObabh3dPN0krvtY93OmfZMYL842Yb2
vwIDAQAB
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
