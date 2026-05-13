import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { requireAuth } from '@/lib/auth';

const BUCKET_NAME = (process.env.AWS_S3_BUCKET_NAME || '').trim();

/**
 * `AWS_S3_BUCKET_NAME` yoksa tüm ortamlarda (canlı dahil) dosya `public/uploads/{pdfs|images}/` altına yazılır.
 * S3’e geçince yalnızca bucket adını ve AWS kimliklerini .env’e eklemeniz yeterli.
 *
 * Not: Vercel gibi salt serverless ortamlarda bu dosyalar deploy’lar arasında kalıcı olmaz;
 * kalıcı disk (VPS, Docker volume vb.) kullanıyorsanız bu mod uygundur.
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// POST - Admin dosya yükleme: S3 (bucket tanımlıysa) veya public/uploads (bucket yoksa)
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and image files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Determine folder based on file type
    const folder = file.type === 'application/pdf' ? 'pdfs' : 'images';
    const key = `${folder}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!BUCKET_NAME) {
      const dir = path.join(process.cwd(), 'public', 'uploads', folder);
      await mkdir(dir, { recursive: true });
      const absPath = path.join(dir, fileName);
      await writeFile(absPath, buffer);
      const publicUrl = `/uploads/${key}`;
      return NextResponse.json({
        url: publicUrl,
        key,
        fileName: file.name,
        size: file.size,
        type: file.type,
      });
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const region = process.env.AWS_REGION || 'us-east-1';
    const publicUrl =
      region === 'us-east-1'
        ? `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
        : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({
      url: publicUrl,
      key,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: unknown) {
    console.error('Error uploading admin file:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
