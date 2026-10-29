/** UTF-8 first; invalid UTF-8 means the file is almost certainly Windows-1251. */
export function decodeFileBytes(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('windows-1251').decode(buffer);
  }
}
