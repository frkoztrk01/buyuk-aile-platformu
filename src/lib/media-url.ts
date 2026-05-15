/**
 * Canlı ortamda `public/uploads` genelde build’e dahil olmaz (gitignore / büyük medya).
 * Aynı yol yapısını S3, R2 veya CloudFront’ta sunduğunuzda, kök adresi env ile verin:
 *
 *   NEXT_PUBLIC_UPLOADS_BASE_URL=https://cdn.example.com
 *
 * Veritabanındaki `/uploads/2022/09/dosya.jpg` → `https://cdn.example.com/uploads/2022/09/dosya.jpg`
 * (Bucket’ta object key’ler `uploads/2022/09/...` olmalı veya CDN bu path’i bu şekilde eşlemeli.)
 *
 * Env yoksa yollar olduğu gibi kalır (yerelde `public/uploads` ile çalışır).
 */

export function withResolvedNewsFields<
  T extends { content: string; imageUrl: string | null },
>(row: T): T {
  return {
    ...row,
    content: rewriteUploadsInText(row.content),
    imageUrl: row.imageUrl ? resolvePublicMediaUrl(row.imageUrl) : row.imageUrl,
  };
}

export function withResolvedHomeHeroFields<
  T extends {
    backgroundImageUrl: string | null;
    logoUrl: string | null;
  },
>(row: T): T {
  return {
    ...row,
    backgroundImageUrl: row.backgroundImageUrl
      ? resolvePublicMediaUrl(row.backgroundImageUrl)
      : row.backgroundImageUrl,
    logoUrl: row.logoUrl ? resolvePublicMediaUrl(row.logoUrl) : row.logoUrl,
  };
}

export function withResolvedAboutFields<
  T extends {
    content: string;
    heroImageUrl: string | null;
    heroQuote: string | null;
    heroQuoteSource: string | null;
  },
>(row: T): T {
  return {
    ...row,
    content: rewriteUploadsInText(row.content),
    heroImageUrl: row.heroImageUrl
      ? resolvePublicMediaUrl(row.heroImageUrl)
      : row.heroImageUrl,
    heroQuote: row.heroQuote ? rewriteUploadsInText(row.heroQuote) : row.heroQuote,
    heroQuoteSource: row.heroQuoteSource
      ? resolvePublicMediaUrl(row.heroQuoteSource)
      : row.heroQuoteSource,
  };
}

export function withResolvedFounderFields<T extends { logoUrl: string }>(row: T): T {
  return {
    ...row,
    logoUrl: resolvePublicMediaUrl(row.logoUrl),
  };
}

export function withResolvedMutabakatFields<
  T extends { pdfUrl: string | null },
>(row: T): T {
  return {
    ...row,
    pdfUrl: row.pdfUrl ? resolvePublicMediaUrl(row.pdfUrl) : row.pdfUrl,
  };
}

export function withResolvedManifestoFields<
  T extends { pdfUrl: string | null },
>(row: T): T {
  return {
    ...row,
    pdfUrl: row.pdfUrl ? resolvePublicMediaUrl(row.pdfUrl) : row.pdfUrl,
  };
}

export function withResolvedMemberFields<T extends { name: string }>(row: T): T {
  return {
    ...row,
    name: rewriteUploadsInText(row.name),
  };
}

export function withResolvedMeetingFields<
  T extends { videoUrl: string | null; description: string | null },
>(row: T): T {
  return {
    ...row,
    videoUrl: row.videoUrl ? resolvePublicMediaUrl(row.videoUrl) : row.videoUrl,
    description: row.description
      ? rewriteUploadsInText(row.description)
      : row.description,
  };
}

function uploadsOrigin(): string {
  return (process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? '').trim().replace(/\/+$/, '');
}

/** Tek bir medya URL’si (kapak, logo, pdf, hero). */
export function resolvePublicMediaUrl(input: string | null | undefined): string {
  if (input == null || input === '') return '';
  const s = input.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || s.startsWith('//')) return s;
  const origin = uploadsOrigin();
  if (!origin || !s.startsWith('/uploads')) return s;
  return `${origin}${s}`;
}

/** HTML veya markdown içindeki tüm `/uploads/...` geçişlerini CDN köküne taşır. */
export function rewriteUploadsInText(text: string | null | undefined): string {
  if (text == null || text === '') return text ?? '';
  const origin = uploadsOrigin();
  if (!origin) return text;
  return text.split('/uploads/').join(`${origin}/uploads/`);
}
