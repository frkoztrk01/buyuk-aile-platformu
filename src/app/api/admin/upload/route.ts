import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadAdminFile } from '@/lib/upload-storage';

// POST - Admin dosya yükleme: S3 (canlı) veya public/uploads (yerel geliştirme)
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and image files are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const folder = file.type === 'application/pdf' ? 'pdfs' : 'images';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { publicUrl, key, storage } = await uploadAdminFile(
      buffer,
      file.type,
      folder,
      fileName
    );

    return NextResponse.json({
      url: publicUrl,
      key,
      fileName: file.name,
      size: file.size,
      type: file.type,
      storage,
    });
  } catch (error: unknown) {
    console.error('Error uploading admin file:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    const status = message.includes('AWS S3') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
