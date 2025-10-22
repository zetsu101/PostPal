import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, generatePresignedDownloadUrl, deleteFromS3, generateFileKey } from '@/lib/s3';
import { apiMiddleware } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  try {
    // Apply API middleware
    const middlewareResult = await apiMiddleware(request);
    if (middlewareResult) return middlewareResult;

    const body = await request.json();
    const { filename, contentType, userId, folder = 'uploads' } = body;

    if (!filename || !contentType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, contentType, userId' },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileKey = generateFileKey(userId, filename, folder);

    // Generate presigned URL for upload
    const uploadUrl = await generatePresignedUploadUrl(fileKey, contentType, 3600); // 1 hour expiry

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileKey,
      expiresIn: 3600,
    });

  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply API middleware
    const middlewareResult = await apiMiddleware(request);
    if (middlewareResult) return middlewareResult;

    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('key');
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600');

    if (!fileKey) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      );
    }

    // Generate presigned URL for download/viewing
    const downloadUrl = await generatePresignedDownloadUrl(fileKey, expiresIn);

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn,
    });

  } catch (error) {
    console.error('Presigned download URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
