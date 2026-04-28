const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Base GET request.
 * Throws a descriptive error on non-2xx responses.
 *
 * @param {string} path
 * @returns {Promise<any>}
 */
export async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}