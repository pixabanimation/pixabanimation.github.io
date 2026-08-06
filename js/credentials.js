// ============================================
// pixabanimation — Encrypted Database Credentials
// ============================================
// The Turso database URL + auth token are encrypted with AES-256-GCM.
// The ciphertext lives in this file; the 256-bit key lives separately in
// js/credentials-key.js (split-secret). Neither file contains plaintext.
//
// This runtime decrypts and exposes `window.__getCredentials()`, an async
// function returning `{ url, authToken }`. Pages must load js/credentials-key.js
// BEFORE this file and then `await window.__getCredentials()`.
//
// REGENERATE with:  node tools/encrypt-credentials.mjs

const _CREDENTIALS_PAYLOAD = 'beb5e7408e622e3b8586523e:0b5c398ab1fadfc9aaacdcea3a914fe5:7a016868fbc5c22a505fe2915b0f108463255369d16cb8b83c4d69902f3c94b0faae864f37f6eccbf336d98d29af774e30fdb9437699fb17c939d05ebcbeea43d47f7bc981983535e8a35a76c221ad26c117954c56ce55122d03433c264293df9c170cd41843b8e11b3128a9821e4404b2af6eec7867a4fe17fb5d79b73966991c8ea052dfd280876e9a8f9f2f611894ae5a2ac0ec76a784faf6ef3dcdd8e583786d1f2632c0ea0f81097af9559fe721b601fb40386940163d62fac926ff011bc54d9b5e7819e5143a6e0e6b4f7119ffa9ffe5d257963c39680b657894c036f56c0cb15b2f49032eb007568d8fa34b0f1daceb87d756cc026a2e529421a504ee2713088254d741a06340b74a6dd2058c19fdfadb83f6ce2518ff31ca7882b211a58dedb9b42e1111e1c5f125256fedaf5cbe8849df925950f216ffba36b3a667a64f74c2b15378a5bd64a438104df8a8911b9f88a7bddd73d7e700f1a21b949a7ba8ee9deff1a2f04274078fc9ecb339146adb9d0fbccf64f771e82b561e290ee22d2aac3523c746a343b219961febbc2bd553b22f661ffd3447453f43a209795a7e739e2f9a33c3';

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

async function __getCredentials() {
  if (typeof _CREDENTIALS_KEY === 'undefined') {
    throw new Error('js/credentials-key.js must be loaded before js/credentials.js');
  }
  try {
    return await _decryptPayload();
  } catch (error) {
    console.error('Failed to decrypt database credentials:', error);
    throw error;
  }
}

window.__getCredentials = __getCredentials;
