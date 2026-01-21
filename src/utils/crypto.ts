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

// RSA私钥 - 用于解密（实际项目中私钥应该只在服务器端）
export const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLKEtbM+d0SLbb
9Ns99CHOoIUOHCexSPg8o5MNIyoalOfwFeZf7Lc4+UAWhVWsazP0vzhRHicbtQ+1
dLeoZYoASqCwPOLA+Zq68hd/mhNMTX+u2+B+Ce2usAdUqIiez4lExd+171naghAC
P5oXIaCept8ihPCHdmlp4W5Rn67OGVeI0Py+HQdpcsZ2dh55Jjz0aSGyqlUH8o9t
PEgQGcqNFjhRvxXo2F/H7XmDM+UdJvp/jk185LLxKEXRz9nOTCVt5Vki3b99rnx1
iAmuaVdtrPjhCj/+7UUYfG4406Fik48cLXtJhZURpaIHWhVQXTr5GEgUH95c9btH
ae4xhy1PAgMBAAECggEAapiK6aDTWhVpNQJGIzy8nGFnTx8AyKnj7lVZrDP+PJJT
HIsxJLXc8Vz+/pIZgO2DBnFrCE0M8iHPy0Mhto8ImNyPccmQpPaS9HJgWAitBYVI
cKRYJ2noN5ePUSFZBhMZEGfO2PRsrhU+dx+OJ4LydyxRuhgM6Nb9upuZOeTSYLrE
jqGKTvB7In9GaM37spJCAiKjm8yO0SNxQw7jYbNoW00Nd61uLbtUI3dGrwqtGQlg
yeflC4GRz6oRpM1bFhwhdCYaUPi3GY8FU8qSDurSZuPmZ5Y5ZlqUJtbE9UkNCPV+
vJoHZN7V5y63RHa2FZ4KGKWo9Wj0EeHRyzBVwuO8oQKBgQD+W/wN9dkUP14BRsaG
2ELO6qu0/Y4C6iEIMdKYzUX5cErcm2uJlBYfCKlZQEDIuXOq/X1VAzLISqAjZBv6
7cOUlJw47HbooSFO9wkDYtKqsp675kImHcwGm7Ev/LDJL0T8sBo1ILgPQnVpSeBe
g2u0x6AkJuirXqc3Q5qlTaV4kQKBgQDMd8L91PPlkCjRyDWfWhcCeXb8K6ajYoIv
+CYqZD2c2Hi3dl6zjGWCFUde68UUViH4Md/nM2PuaIiOeVqBbZYJVreBKfgIQUEy
vngSh9qmUMXw1t0ltGcE7fnTcM6e3IkJiUZpW8oozYnaJ3r177dzTvWfjWdAQOo+
67moh7w33wKBgEviZXBEyF6iCQmYc+IG4ueYW2HDw3pbHz+ynYG4vAeO2Ma4F30U
EQVxMBTQdoNr0HZS6fFS4vOeT+g/FZnnFVJeg7z3zwHYEHfee3HnKbKDV5f3OgTl
HtlZ2aLXYGalE4/PegIfoMnsqdqfj7CixJ9KbxxZ/1AhDQIPyTNH1vYBAoGBAMek
MBoT8ci2B4U9zU24czsRSmJSZLSnHKKl0u4VTit1GflYdIMvlHV9PWCrKJUAvM5Q
NGTUwsAoBR3H090IGTUpHKfbSLkWrghT/X1qdM1rlLnhsbB9AxHHIuWXAcgPYSaU
iNGatDs+5VjCr8autxq5gA63zJbqS04AcBjj351VAoGAGcD3JN6lBAIrn4gO2Y5o
mJgo0AgbXGUYbhAcmWsucowKRXlmiudE01igf5lBj1Sa/C92kCuoVZj6eU5W05L5
nZFZqyfqQjQyV2i1/Jy/fkpq5bpUvG6SWPsREdQUft87B28YN1YyIoEjNCXff4nd
iqzRv0Roa1g7+5KocEqEsTU=
-----END PRIVATE KEY-----
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
