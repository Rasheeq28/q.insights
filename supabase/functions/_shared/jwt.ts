// Shared JWT utilities for Supabase Edge Functions (Deno)
// Uses native Web Crypto API — no external dependencies

export interface TokenPayload {
  filters: {
    companies: string[];
    sectors: string[];
    start: string;
    end: string;
  };
  plan: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): Uint8Array {
  // Pad to make base64 valid
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Sign a JWT token with the given payload and secret.
 * Uses HS256 algorithm.
 * @param payload - The claims payload (must include exp as Unix timestamp)
 * @param secret  - The secret string for HMAC signing
 */
export async function signToken(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();

  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));

  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await getKey(secret);
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(signingInput)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signatureBytes));
  return `${signingInput}.${signatureB64}`;
}

/**
 * Verify a JWT token and return the decoded payload.
 * Throws an error if the token is invalid or expired.
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<TokenPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;

  const enc = new TextEncoder();
  const key = await getKey(secret);
  const signatureBytes = base64UrlDecode(signatureB64);

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    enc.encode(signingInput)
  );

  if (!isValid) {
    throw new Error("Invalid token signature");
  }

  const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
  const payload = JSON.parse(payloadJson) as TokenPayload;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error("Token expired");
  }

  return payload;
}
