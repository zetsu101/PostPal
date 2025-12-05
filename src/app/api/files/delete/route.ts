import { NextRequest, NextResponse } from 'next/server';
import { deleteFromS3 } from '@/lib/s3';
import { apiMiddleware } from '@/lib/api-middleware';

export async function DELETE(request: NextRequest) {
  try {
    // Apply API middleware
    const middlewareResult = await apiMiddleware(request);
    if (middlewareResult) return middlewareResult;

    const body = await request.json();
    const { fileKey, userId } = body;

    if (!fileKey || !userId) {
      return NextResponse.json(
        { error: 'File key and user ID are required' },
        { status: 400 }
      );
    }

    // Verify the file belongs to the user (in a real app, you'd check this in your database)
    if (!fileKey.includes(`/${userId}/`)) {
      return NextResponse.json(
        { error: 'Unauthorized: File does not belong to user' },
        { status: 403 }
      );
    }

    // Delete the main file
    await deleteFromS3(fileKey);

    // Also delete thumbnail if it exists
    const thumbnailKey = fileKey.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.jpg');
    try {
      await deleteFromS3(thumbnailKey);
    } catch (_error) {
      // Thumbnail might not exist, that's okay
      console.log('Thumbnail not found or already deleted:', thumbnailKey);
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
