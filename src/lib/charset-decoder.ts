import { isLfiAttempt } from "./generator/security";

const KNOWN_CHARSETS: Record<string, string> = {
  "utf-8": "utf-8",
  utf8: "utf-8",
  "iso-8859-1": "iso-8859-1",
  "windows-1252": "windows-1252",
  latin1: "iso-8859-1",
  "us-ascii": "utf-8",
  gbk: "gbk",
  gb2312: "gb2312",
  big5: "big5",
  shift_jis: "shift_jis",
  "euc-kr": "euc-kr",
};

export interface CharsetDecodeResult {
  success: boolean;
  text?: string;
  charset: string | null;
  message?: string;
}

export function decodeWithCharset(
  buffer: ArrayBuffer,
  contentTypeHeader: string | null,
  _sourceHint?: string // e.g. URL or file path for LFI context
): CharsetDecodeResult {
  let charset: string | null = null;
  if (contentTypeHeader) {
    const match = contentTypeHeader.match(/charset=([^;]+)/i);
    if (match) {
      const extracted = match[1]?.trim() ?? null;
      if (extracted) {
        charset = KNOWN_CHARSETS[extracted.toLowerCase()] ?? extracted;
      }
    }
  }

  if (!charset) {
    return {
      success: true,
      text: new TextDecoder("utf-8").decode(buffer),
      charset: null,
    };
  }

  // LFI guard — if charset hint looks like a local file path, block it
  if (_sourceHint && isLfiAttempt(_sourceHint)) {
    return {
      success: false,
      charset,
      message: `LFI_BLOCKED: Source "${_sourceHint}" is a local file path and cannot be used as a content source`,
    };
  }

  const normalizedCharset = charset.toLowerCase();
  if (!KNOWN_CHARSETS[normalizedCharset]) {
    return {
      success: false,
      charset,
      message: `Unsupported Character Encoding: "${charset}" — only UTF-8 and common legacy encodings are supported`,
    };
  }

  try {
    const text = new TextDecoder(charset).decode(buffer);
    return { success: true, text, charset };
  } catch {
    return {
      success: false,
      charset,
      message: `Failed to decode content using "${charset}" encoding`,
    };
  }
}

export function extractCharset(contentTypeHeader: string | null): string | null {
  if (!contentTypeHeader) return null;
  const match = contentTypeHeader.match(/charset=([^;]+)/i);
  return match ? (match[1]?.trim() ?? null) : null;
}
