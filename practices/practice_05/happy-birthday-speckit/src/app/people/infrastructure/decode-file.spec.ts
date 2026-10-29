import { decodeFileBytes } from './decode-file';

describe('decodeFileBytes', () => {
  it('decodes UTF-8 and strips the BOM', () => {
    const bytes = new TextEncoder().encode('﻿Марина');
    expect(decodeFileBytes(bytes.buffer as ArrayBuffer)).toBe('Марина');
  });

  it('falls back to Windows-1251', () => {
    // "Мир" in Windows-1251
    const bytes = new Uint8Array([0xcc, 0xe8, 0xf0]);
    expect(decodeFileBytes(bytes.buffer)).toBe('Мир');
  });
});
