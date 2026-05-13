/**
 * Rewrite legacy WordPress media URLs inside HTML or plain URL strings.
 * Preserves path segments after `/wp-content/uploads/` (including file extension).
 */

export interface WpUploadUrlRewriteOptions {
  /**
   * Hostnames to match (no scheme), e.g. `www.buyukaileplatformu.org`.
   * `https://`, `http://`, and protocol-relative `//` are all handled.
   */
  sourceHosts: string[];
  /**
   * Replacement for `/wp-content/uploads/RELATIVE` segments.
   * No trailing slash. E.g. `/uploads` or `https://cdn.example.com/media`.
   */
  mediaPublicBase: string;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace known WP host + `/wp-content/uploads/` with `mediaPublicBase + '/' + relative`.
 */
export function rewriteWpUploadUrls(
  input: string,
  opts: WpUploadUrlRewriteOptions
): string {
  if (!input || opts.sourceHosts.length === 0) return input;
  const base = opts.mediaPublicBase.replace(/\/+$/, '');
  let out = input;
  for (const host of opts.sourceHosts) {
    const h = host.replace(/^\/+|\/+$/g, '');
    if (!h) continue;
    const escaped = escapeRegex(h);
    const re = new RegExp(
      `(?:https?:\\/\\/|\\/\\/)${escaped}\\/wp-content\\/uploads\\/`,
      'gi'
    );
    out = out.replace(re, `${base}/`);
  }
  return out;
}
