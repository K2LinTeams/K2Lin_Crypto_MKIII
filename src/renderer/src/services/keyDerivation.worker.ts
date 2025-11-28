import { scrypt } from 'scrypt-js'

self.onmessage = async (e: MessageEvent): Promise<void> => {
  const { password, salt, N, r, p, dkLen } = e.data

  try {
    // scrypt-js returns a Promise<Uint8Array>
    const derivedKey = await scrypt(password, salt, N, r, p, dkLen)
    self.postMessage({ success: true, key: derivedKey })
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message })
  }
}
