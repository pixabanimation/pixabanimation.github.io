// ============================================
// pixabanimation — Encrypted Database Credentials
// ============================================
// The Turso database URL + auth token are encrypted with AES-256-GCM.
// The ciphertext lives in this file; the 256-bit key lives separately in
// js/credentials-key.js (split-secret). Neither file contains plaintext.
//
// Exposes `__getCredentials()` (async → { url, authToken }).
// REGENERATE with:  node tools/encrypt-credentials.mjs

import { _CREDENTIALS_KEY } from './credentials-key.js';

const _CREDENTIALS_PAYLOAD = '6a717ffc77535915545bc3b6:d2edfbe93073965c0340e94531a7444c:2da10726195405644a229ca5a9ea79dccd105d4e615d7489285a1223ac142666f0be42a0d6eba04b4d62debeddd8b5b2671bc554db37f58216ba04431e76b750be9aaee335519dd0935801dc6ed2bd83ba9764adfbc4b6f41f75578e57c41ff4a8c7327373a9d7f6fea623ca23fc65496b0c4448531239f675cd9b957c295f4a158f51d6d9d0ff485f3b523a363c554cfe930e62fa38073ceb30a2ca73a4f806fa29cbe0f3a3697678c22265f5f1a3b96500ed69a44e912cff35d4b863d8127e1c32a7e9e4f4eb6ddbf86b289d79d204235fe430204f74c952731c826cd578a6609be051b1130ce33548d3ebf1d2ff101e9519f732dbc66648387a74e72f42e8e2244b94320284e31632874015927e58801fe7fc086258be216a82b9d04d404d1f9a1bf973a4e11ce73f778517eed467ce22860c9481351c7370c68e153eaa9963fdb4ff1ac78723d05084d65604dc8f01576f3ee7f2f5003dcd46ca7d3f53d0fc985141cb06e8566e181cddb026d47e16958af9c186f121b1bb06369e6fb9b196693fc52db4a5d0581bd3601a8616155e4a6f34487578bd06a9db392067a89fb2d3318e088e4279';

function _hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function _base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function _decryptPayload() {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    _base64ToBytes(_CREDENTIALS_KEY),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const [ivHex, tagHex, dataHex] = _CREDENTIALS_PAYLOAD.split(':');
  const iv = _hexToBytes(ivHex);
  const tag = _hexToBytes(tagHex);
  const data = _hexToBytes(dataHex);

  // WebCrypto AES-GCM expects ciphertext with the auth tag appended.
  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data, 0);
  combined.set(tag, data.length);

  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, combined);
  return JSON.parse(new TextDecoder().decode(plain));
}

export async function __getCredentials() {
  try {
    return await _decryptPayload();
  } catch (error) {
    console.error('Failed to decrypt database credentials:', error);
    throw error;
  }
}
