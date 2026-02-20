/**
 * Exness Partnership API helper
 * - getExnessToken()  → JWT token (cached, auto-refresh)
 * - checkExnessAffiliation(email) → { affiliated, clientUid }
 */

const EXNESS_AUTH_URL  = "https://my.xsspartners.com/api/v2/auth/";
const EXNESS_AFFIL_URL = "https://my.xsspartners.com/api/partner/affiliation/";

let cachedToken: string | null = null;
let tokenExpiresAt = 0; // Unix seconds

export async function getExnessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiresAt - 300 > now) return cachedToken;

  const login    = process.env.EXNESS_PARTNER_LOGIN;
  const password = process.env.EXNESS_PARTNER_PASSWORD;
  if (!login || !password) throw new Error("Konfigurasi Exness API tidak ditemukan.");

  const res = await fetch(EXNESS_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  if (!res.ok) throw new Error(`Exness auth gagal: ${res.status}`);

  const data = (await res.json()) as { token: string };
  cachedToken = data.token;

  try {
    const payload = JSON.parse(
      Buffer.from(data.token.split(".")[1], "base64url").toString()
    ) as { exp: number };
    tokenExpiresAt = payload.exp;
  } catch {
    tokenExpiresAt = now + 3600;
  }
  return cachedToken;
}

export interface AffiliationResult {
  affiliated: boolean;
  clientUid: string | null;
}

export async function checkExnessAffiliation(email: string): Promise<AffiliationResult> {
  const doRequest = async (token: string) =>
    fetch(EXNESS_AFFIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email }),
    });

  let res = await doRequest(await getExnessToken());

  if (res.status === 401) {
    cachedToken = null;
    tokenExpiresAt = 0;
    res = await doRequest(await getExnessToken());
  }

  if (!res.ok) throw new Error(`Exness affiliation check gagal: ${res.status}`);

  const data = (await res.json()) as {
    affiliation: boolean;
    accounts: string[];
    client_uid: string | null;
  };

  return {
    affiliated: data.affiliation === true,
    clientUid: data.client_uid ?? null,
  };
}
