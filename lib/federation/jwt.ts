// Federation JWTs, EdDSA-signed via `jose`. Two kinds of tokens:
//
// 1. Link tokens (5m expiry) — the one-time "prove who I am, here's what I'm
//    requesting" handshake used when a user clicks "Connect account" in
//    either app. The issuing app signs it with its own private key; the
//    receiving app verifies it with the issuer's public key.
//
// 2. Request tokens (2m expiry) — used by this app (Alliance) to pull data
//    from the sibling Neu Rafiki app on behalf of a linked account (e.g. to
//    call Neu Rafiki's assessment-results API). Neu Rafiki is the only app
//    that needs to verify these in this design, so this repo only needs to
//    mint them, not verify them.

import { SignJWT, jwtVerify } from "jose"
import { getOwnPrivateKey, getSiblingPublicKey } from "@/lib/federation/keys"
import { SIBLING_APP_ID } from "@/lib/federation/config"

export interface LinkTokenPayload {
  iss: "alliance" | "neurafiki"
  sub: string // issuing app's local user id (uuid)
  email: string // issuing user's email — shown on the consent screen so the user can confirm it's them
  scopes: string[] // e.g. ["assessment_sync"]
}

export async function signLinkToken(payload: LinkTokenPayload): Promise<string> {
  const key = await getOwnPrivateKey()
  return new SignJWT({ email: payload.email, scopes: payload.scopes })
    .setProtectedHeader({ alg: "EdDSA" })
    .setIssuer(payload.iss)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key)
}

// Verifies a link token that THE SIBLING issued (i.e. this function is called
// by the app RECEIVING a /connect?token=... redirect, to verify the other
// app's signature using the sibling's public key).
export async function verifySiblingLinkToken(token: string): Promise<LinkTokenPayload> {
  const key = await getSiblingPublicKey()
  const { payload } = await jwtVerify(token, key, { issuer: SIBLING_APP_ID })
  return {
    iss: payload.iss as "alliance" | "neurafiki",
    sub: payload.sub as string,
    email: payload.email as string,
    scopes: payload.scopes as string[],
  }
}

export interface RequestTokenPayload {
  iss: "alliance"
  requesting_user_id: string // this app's local user id making the request
  target_remote_user_id: string // the sibling's local user id whose data is being requested (from the linked_accounts row)
  scope: string // single scope this request needs, e.g. "assessment_sync"
}

export async function signRequestToken(payload: RequestTokenPayload): Promise<string> {
  const key = await getOwnPrivateKey()
  return new SignJWT({
    requesting_user_id: payload.requesting_user_id,
    target_remote_user_id: payload.target_remote_user_id,
    scope: payload.scope,
  })
    .setProtectedHeader({ alg: "EdDSA" })
    .setIssuer(payload.iss)
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(key)
}
