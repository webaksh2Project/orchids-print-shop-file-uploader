import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import File from '@/models/File';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const files = await File.find({ shopId: session.shopId })
      .select('-fileData')
      .sort({ uploadedAt: -1 })
      .lean();

    const filesWithId = files.map((file) => ({
      id: file._id.toString(),
      customerName: file.customerName,
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      uploadedAt: file.uploadedAt.toISOString(),
    }));

    return NextResponse.json({ files: filesWithId });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Failed to get files' },
      { status: 500 }
    );
  }
}
