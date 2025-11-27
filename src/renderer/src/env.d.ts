/// <reference types="vite/client" />

declare module 'scrypt-js' {
  export function scrypt(
    password: Uint8Array | number[],
    salt: Uint8Array | number[],
    N: number,
    r: number,
    p: number,
    dkLen: number
  ): Promise<Uint8Array>
}
