import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productName = (formData.get('productName') as string) || 'product';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedProductName = productName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    const fileExtension = file.name.split('.').pop();
    const filename = `${sanitizedProductName}_${timestamp}.${fileExtension}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
const uint8array = new Uint8Array(bytes);
const buffer = Buffer.from(uint8array);
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    // Return the public URL
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Handle GET requests (optional - for listing uploaded files)
export async function GET() {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');

    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ files: [] });
    }

    // This is a basic implementation - you might want to add pagination, filtering, etc.
    return NextResponse.json({
      message: 'Upload endpoint is working',
      uploadsPath: '/uploads/',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to access uploads' },
      { status: 500 }
    );
  }
}
