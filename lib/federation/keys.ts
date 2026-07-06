// Ed25519 key handling for federation JWTs (see lib/federation/jwt.ts).
//
// Keys are stored in env vars as PKCS8/SPKI PEM with real newlines replaced
// by the literal two-character sequence "\n" so they fit on one env var line
// (the same pattern commonly used for RSA private keys in env vars).

import { importPKCS8, importSPKI } from "jose"

function unescapePem(value: string): string {
  return value.replace(/\\n/g, "\n")
}

// This app's own Ed25519 private key. Used to sign link tokens and request
// tokens that this app issues.
export async function getOwnPrivateKey() {
  const raw = process.env.FEDERATION_PRIVATE_KEY
  if (!raw) throw new Error("FEDERATION_PRIVATE_KEY is not configured")
  return importPKCS8(unescapePem(raw), "EdDSA")
}

// The sibling Neu Rafiki app's Ed25519 public key. Used to verify tokens
// issued by Neu Rafiki (e.g. a link token embedded in a /connect?token=...
// redirect into this app).
export async function getSiblingPublicKey() {
  const raw = process.env.FEDERATION_NEURAFIKI_PUBLIC_KEY
  if (!raw) throw new Error("FEDERATION_NEURAFIKI_PUBLIC_KEY is not configured")
  return importSPKI(unescapePem(raw), "EdDSA")
}
