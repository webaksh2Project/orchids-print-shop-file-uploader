import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import File from '@/models/File';
import User from '@/models/User';
import { checkRateLimit } from '@/lib/ratelimit';
import { notifyFileUpload } from '@/lib/socket';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const shopId = formData.get('shopId') as string;
    const customerName = formData.get('customerName') as string;
    const file = formData.get('file') as File;

    if (!shopId || !customerName || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isAllowed = await checkRateLimit(shopId);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before uploading again.' },
        { status: 429 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    await connectDB();

    const shop = await User.findOne({ shopId });
    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const uploadedFile = await File.create({
      shopId,
      customerName,
      fileName: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      fileData: buffer,
      uploadedAt: new Date(),
      expiresAt,
    });

    notifyFileUpload(shopId, {
      id: uploadedFile._id.toString(),
      customerName: uploadedFile.customerName,
      fileName: uploadedFile.fileName,
      fileSize: uploadedFile.fileSize,
      uploadedAt: uploadedFile.uploadedAt.toISOString(),
      mimeType: uploadedFile.mimeType,
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
