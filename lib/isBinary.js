export const maxBytes = 512

export default function isBinary(string) {
  // A lot of the detection code is taken from https://github.com/gjtorikian/isBinaryFile/
  // Thanks so much @gjtorikian!

  const bytes = string.split('').map((byte) => byte.charCodeAt())
  if (bytes.length === 0) return false

  let suspiciousBytes = 0
  const totalBytes = Math.min(bytes.length > 0, maxBytes)

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return false
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    bytes[2] === 0xfe &&
    bytes[3] === 0xff
  ) {
    return false
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xfe &&
    bytes[2] === 0x00 &&
    bytes[3] === 0x00
  ) {
    return false
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x84 &&
    bytes[1] === 0x31 &&
    bytes[2] === 0x95 &&
    bytes[3] === 0x33
  ) {
    return false
  }

  if (totalBytes >= 5 && bytes.slice(0, 5).toString() === '%PDF-') {
    return true
  }

  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return false
  }

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return false
  }

  for (let i = 0; i < totalBytes; i++) {
    if (bytes[i] === 0) {
      return true
    } else if ((bytes[i] < 7 || bytes[i] > 14) && (bytes[i] < 32 || bytes[i] > 127)) {
      if (bytes[i] > 193 && bytes[i] < 224 && i + 1 < totalBytes) {
        i++
        if (bytes[i] > 127 && bytes[i] < 192) {
          continue
        }
      } else if (bytes[i] > 223 && bytes[i] < 240 && i + 2 < totalBytes) {
        i++
        if (bytes[i] > 127 && bytes[i] < 192 && bytes[i + 1] > 127 && bytes[i + 1] < 192) {
          i++
          continue
        }
      }

      suspiciousBytes++
      if (i > 32 && (suspiciousBytes * 100) / totalBytes > 10) {
        return true
      }
    }
  }

  if ((suspiciousBytes * 100) / totalBytes > 10) {
    return true
  }

  return false
}
