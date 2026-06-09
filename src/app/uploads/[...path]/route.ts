import { NextRequest, NextResponse } from 'next/server';
import { readStoredUpload } from '@/lib/upload-storage';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

/** `/uploads/...` — yerel disk veya S3'ten dosya sunar (canlıda kalıcı depolama). */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { path: segments } = await context.params;
  if (!segments?.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const relative = segments.join('/');
  const stored = await readStoredUpload(relative);
  if (!stored) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(stored.body), {
    status: 200,
    headers: {
      'Content-Type': stored.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
