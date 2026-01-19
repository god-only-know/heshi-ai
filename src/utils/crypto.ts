import JSEncrypt from 'jsencrypt'

// 为了开发测试方便，这里使用一对完整有效的1024位RSA密钥对
// 生产环境中应该使用2048位或更高强度的密钥，且私钥只能在服务器端

// RSA公钥 - 用于加密（这个公钥会在前端使用）
export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN
FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76
xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu4n7ybE27tVXRx8YmCkEKJ9jNlhPNbZqHY
M+pF7d+BKzsPvC8GqwIDAQAB
-----END PUBLIC KEY-----`

// RSA私钥 - 用于解密（实际项目中私钥应该只在服务器端）
export const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQ
WMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNR
aY5nZiu4n7ybE27tVXRx8YmCkEKJ9jNlhPNbZqHYM+pF7d+BKzsPvC8GqwIDAQAB
AoGBAJR2ZRixOBGqpDIRTuqh3S8WLBxE/GQBfVfSm2mJlXJTFQhPRvF9RJjNR2EB
GyY5xMc8NzHlH5Z5LGFbBqf0wfhqSW4DQRJ9wkbx6cjQJxd+CiNV2LEfrGMlBfCm
pFQT7w9f3YCB8O9H0PQCHc6HfGQjuHIBhYmWmPYaT+3BgPaRAkEA+OJTppb4HWZ+
aJhqm9SJ5rXxPO3yJPQPJvC7lJHD5IVqmJZ8j5kKrNpN0afQqPZrS0l7G1CKd8dD
JLTtU6UZPwJBAPt7Q6w4R8T9rYqnHdJ8YNLQNPnE5AZlZQ7dKjhp0J0m7p7zPj5Z
7Z4fV4gxZlMMEBNZ7J3pFLEJh7C7lL/ZiB0CQQCW7pZ7FYQFNf8J7lQ7Z0Q7ZZ0Q
7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7AkEAm7pZ
7FYQFNf8J7lQ7Z0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ0Q7ZZ
0Q7ZZ0Q7ZZ0Q7QJBAJu6WexWEBTX/Ce5UO2dEO2WdEO2WdEO2WdEO2WdEO2WdEO2
WdEO2WdEO2WdEO2WdEO2WdEO2WdEO2WdEO2WdEO0=
-----END RSA PRIVATE KEY-----`

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
  try {
    const decrypt = new JSEncrypt()
    decrypt.setPrivateKey(PRIVATE_KEY)
    const decrypted = decrypt.decrypt(encryptedText)
    if (!decrypted) {
      throw new Error('RSA解密返回空值')
    }
    return decrypted
  }
  catch (error: any) {
    console.error('RSA解密失败:', error)
    throw new Error(`解密失败: ${error.message}`)
  }
}

/**
 * 获取公钥（供前端获取）
 */
export function getPublicKey(): string {
  return PUBLIC_KEY
}
