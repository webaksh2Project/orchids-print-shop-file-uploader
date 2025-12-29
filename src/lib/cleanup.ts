import { connectDB } from './mongodb';
import File from '@/models/File';

export async function cleanupExpiredFiles() {
  try {
    await connectDB();
    
    const result = await File.deleteMany({
      expiresAt: { $lte: new Date() },
    });

    console.log(`Cleaned up ${result.deletedCount} expired files`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired files:', error);
    return 0;
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupExpiredFiles();
  }, 60 * 60 * 1000);
}
