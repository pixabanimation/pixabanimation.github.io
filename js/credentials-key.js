// ============================================
// pixabanimation — AES-256 key (base64)
// ============================================
// Used by js/credentials.js to decrypt the database credentials.
// Stored separately from the ciphertext (split-secret). Because this is a
// static site this file ships to the browser — do NOT rely on it alone to
// protect the token; rotate the token if it ever leaked.

const _CREDENTIALS_KEY = 'kYjxVqHTH7lVsBb7VgguSKAdKp1Oo68Y+mjg+x8pnCI=';
