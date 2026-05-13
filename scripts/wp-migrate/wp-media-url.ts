/**
 * Resolve a WordPress media path to an absolute URL.
 * `_wp_attached_file` values are typically relative (e.g. `2023/01/foo.pdf`);
 * `guid` is usually absolute already.
 */
export function resolveMediaUrl(
  rawValue: string | null | undefined,
  mediaBaseUrl: string | undefined
): string | null {
  const value = (rawValue ?? '').trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (!mediaBaseUrl) return null;
  const base = mediaBaseUrl.replace(/\/+$/, '');
  const trimmed = value.replace(/^\/+/, '');
  if (trimmed.startsWith('wp-content/')) return `${base}/${trimmed}`;
  return `${base}/wp-content/uploads/${trimmed}`;
}
