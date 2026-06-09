import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const BUCKET_NAME = (process.env.AWS_S3_BUCKET_NAME || '').trim();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
};

export function isS3UploadsEnabled(): boolean {
  return Boolean(BUCKET_NAME);
}

/** Vercel / benzeri serverless — yerel diske yazılan dosyalar kalıcı olmaz. */
export function isEphemeralProductionDeploy(): boolean {
  if (process.env.UPLOADS_FORCE_LOCAL === '1') return false;
  return process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
}

export function mimeFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

/** `/uploads/images/foo.jpg` → `uploads/images/foo.jpg` */
export function uploadsPathToS3Key(uploadsPath: string): string {
  const normalized = uploadsPath.replace(/^\/+/, '');
  return normalized.startsWith('uploads/') ? normalized : `uploads/${normalized}`;
}

/** S3 object key adayları (eski `images/...` yüklemeleri için geriye dönük). */
function s3KeyCandidates(relativeUnderUploads: string): string[] {
  const clean = relativeUnderUploads.replace(/^\/+/, '').replace(/^uploads\//, '');
  const canonical = `uploads/${clean}`;
  const legacy = clean;
  return canonical === legacy ? [canonical] : [canonical, legacy];
}

export type StoredUpload = {
  body: Buffer;
  contentType: string;
};

export async function readStoredUpload(
  relativeUnderUploads: string
): Promise<StoredUpload | null> {
  const clean = relativeUnderUploads.replace(/^\/+/, '').replace(/^uploads\//, '');
  const localPath = path.join(process.cwd(), 'public', 'uploads', clean);

  try {
    const body = await readFile(localPath);
    return { body, contentType: mimeFromPath(localPath) };
  } catch {
    // Yerel dosya yok — S3 dene
  }

  if (!BUCKET_NAME) return null;

  for (const key of s3KeyCandidates(clean)) {
    try {
      const response = await s3Client.send(
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
      );
      const bytes = await response.Body?.transformToByteArray();
      if (!bytes) continue;
      return {
        body: Buffer.from(bytes),
        contentType: response.ContentType ?? mimeFromPath(clean),
      };
    } catch {
      // Sonraki key adayını dene
    }
  }

  return null;
}

export type UploadAdminFileResult = {
  /** Veritabanına yazılacak yol: `/uploads/images/...` */
  publicUrl: string;
  key: string;
  storage: 'local' | 's3';
};

export async function uploadAdminFile(
  buffer: Buffer,
  contentType: string,
  folder: 'images' | 'pdfs',
  fileName: string
): Promise<UploadAdminFileResult> {
  const key = `uploads/${folder}/${fileName}`;
  const publicUrl = `/uploads/${folder}/${fileName}`;

  if (BUCKET_NAME) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return { publicUrl, key, storage: 's3' };
  }

  if (isEphemeralProductionDeploy()) {
    throw new Error(
      'Canlı ortamda dosya yüklemek için AWS S3 yapılandırması gerekli (AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).'
    );
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buffer);
  return { publicUrl, key, storage: 'local' };
}
