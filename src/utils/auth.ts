type SameSite = 'Lax' | 'Strict' | 'None';

const TOKEN_KEY = 'token';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isLocalHost =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '[::1]' ||
  hostname.endsWith('.local');

function getCookieDomain(): string | undefined {
  if (!isBrowser || isLocalHost) return undefined;
  if (hostname === 'admin.zarhub.net' || hostname.endsWith('.admin.zarhub.net')) {
    return '.admin.zarhub.net';
  }
  // Otherwise, current hostname
  return hostname;
}

function buildCookieString(
  name: string,
  value: string,
  {
    days = 7,
    path = '/',
    sameSite = 'Lax',
    secure,
    domain,
  }: {
    days?: number;
    path?: string;
    sameSite?: SameSite;
    secure?: boolean;
    domain?: string;
  } = {},
): string {
  const parts: string[] = [];

  const encoded = encodeURIComponent(value);
  parts.push(`${name}=${encoded}`);

  // Expiration
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  parts.push(`Expires=${expires.toUTCString()}`);
  parts.push(`Max-Age=${days * 24 * 60 * 60}`);

  // Scope
  parts.push(`Path=${path}`);
  if (domain) parts.push(`Domain=${domain}`);

  // Security
  const isHTTPS = isBrowser && window.location.protocol === 'https:';
  const shouldSecure = typeof secure === 'boolean' ? secure : isHTTPS;
  if (shouldSecure) parts.push('Secure');
  // If SameSite=None is requested, Secure is required by browsers
  if (sameSite === 'None' && !parts.includes('Secure')) parts.push('Secure');
  parts.push(`SameSite=${sameSite}`);

  return parts.join('; ');
}

function deleteCookieString(
  name: string,
  {
    path = '/',
    domain,
    sameSite = 'Lax',
  }: { path?: string; domain?: string; sameSite?: SameSite } = {},
): string {
  const parts: string[] = [];
  parts.push(`${name}=`);
  parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  parts.push('Max-Age=0');
  parts.push(`Path=${path}`);
  if (domain) parts.push(`Domain=${domain}`);
  // Keep SameSite to target the same attribute set
  parts.push(`SameSite=${sameSite}`);
  // No Secure on delete is fine; browsers will match and remove
  return parts.join('; ');
}

function escapeForRegex(s: string): string {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function setToken(
  token: string,
  opts?: {
    days?: number;
    path?: string;
    sameSite?: SameSite;
    secure?: boolean;
    domain?: string;
  },
): void {
  if (!isBrowser) return;
  const domain = opts?.domain ?? getCookieDomain();
  const cookie = buildCookieString(TOKEN_KEY, token, {
    days: opts?.days ?? 7,
    path: opts?.path ?? '/',
    sameSite: opts?.sameSite ?? 'Lax',
    secure: opts?.secure,
    domain,
  });
  document.cookie = cookie;
}

export function getToken(): string | null {
  if (!isBrowser) return null;
  const pattern = new RegExp(`(?:^|; )${escapeForRegex(TOKEN_KEY)}=([^;]*)`);
  const match = document.cookie.match(pattern);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function removeToken(opts?: { path?: string; sameSite?: SameSite; domain?: string }): void {
  if (!isBrowser) return;

  // Try to remove all plausible variants (host-only and domain cookie)
  const domainsToTry = new Set<string | undefined>([
    opts?.domain,
    getCookieDomain(),
    undefined, // host-only
  ]);

  for (const d of domainsToTry) {
    const del = deleteCookieString(TOKEN_KEY, {
      path: opts?.path ?? '/',
      sameSite: opts?.sameSite ?? 'Lax',
      domain: d,
    });
    document.cookie = del;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// Optional: generic helpers if you need them elsewhere
export function setCookie(
  name: string,
  value: string,
  opts?: {
    days?: number;
    path?: string;
    sameSite?: SameSite;
    secure?: boolean;
    domain?: string;
  },
): void {
  if (!isBrowser) return;
  const cookie = buildCookieString(name, value, {
    days: opts?.days ?? 7,
    path: opts?.path ?? '/',
    sameSite: opts?.sameSite ?? 'Lax',
    secure: opts?.secure,
    domain: opts?.domain ?? getCookieDomain(),
  });
  document.cookie = cookie;
}

export function getCookie(name: string): string | null {
  if (!isBrowser) return null;
  const pattern = new RegExp(`(?:^|; )${escapeForRegex(name)}=([^;]*)`);
  const match = document.cookie.match(pattern);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function deleteCookie(
  name: string,
  opts?: { path?: string; sameSite?: SameSite; domain?: string },
): void {
  if (!isBrowser) return;
  const domainsToTry = new Set<string | undefined>([opts?.domain, getCookieDomain(), undefined]);
  for (const d of domainsToTry) {
    const del = deleteCookieString(name, {
      path: opts?.path ?? '/',
      sameSite: opts?.sameSite ?? 'Lax',
      domain: d,
    });
    document.cookie = del;
  }
}

// ─────────────────────────────────────────────────────────────
// const TWOF_KEY = 'twof_status';

// function setJSONCookie(
//   name: string,
//   obj: unknown,
//   opts?: {
//     days?: number;
//     path?: string;
//     sameSite?: SameSite;
//     secure?: boolean;
//     domain?: string;
//   },
// ) {
//   try {
//     setCookie(name, JSON.stringify(obj), opts);
//   } catch {}
// }

// function getJSONCookie<T = unknown>(name: string): T | null {
//   const raw = getCookie(name);
//   if (!raw) return null;
//   try {
//     return JSON.parse(raw) as T;
//   } catch {
//     return null;
//   }
// }

// export function setTwoFStatus(
//   status: unknown,
//   opts?: {
//     days?: number;
//     path?: string;
//     sameSite?: SameSite;
//     secure?: boolean;
//     domain?: string;
//   },
// ) {
//   setJSONCookie(TWOF_KEY, status, opts);
// }

// export function getTwoFStatus<T = unknown>(): T | null {
//   return getJSONCookie<T>(TWOF_KEY);
// }

// export function removeTwoFStatus(opts?: { path?: string; sameSite?: SameSite; domain?: string }) {
//   deleteCookie(TWOF_KEY, opts);
// }
