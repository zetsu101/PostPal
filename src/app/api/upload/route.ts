import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateFileKey, validateFile, generatePresignedUploadUrl } from '@/lib/s3';
import { optimizeImage, createThumbnail, extractImageMetadata } from '@/lib/image-optimization';
import { apiMiddleware } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  try {
    // Apply API middleware for authentication and rate limiting
    const middlewareResult = await apiMiddleware(request);
    if (middlewareResult) return middlewareResult;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file, 50); // 50MB max
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate unique file key
    const fileKey = generateFileKey(userId, file.name, folder);
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    let uploadResult;
    let thumbnailUrl: string | null = null;
    let metadata: any = {};

    // Handle image files
    if (file.type.startsWith('image/')) {
      try {
        // Extract metadata
        const imageMetadata = await extractImageMetadata(fileBuffer);
        metadata = {
          ...imageMetadata,
          originalSize: fileBuffer.length,
        };

        // Create optimized version
        const optimized = await optimizeImage(fileBuffer, {
          width: 1200,
          height: 1200,
          quality: 85,
          format: 'webp',
          fit: 'inside',
        });

        // Upload optimized image
        uploadResult = await uploadToS3(
          optimized.buffer,
          fileKey,
          'image/webp',
          {
            originalName: file.name,
            userId,
            folder,
            optimized: 'true',
            ...metadata,
          }
        );

        // Create and upload thumbnail
        const thumbnailBuffer = await createThumbnail(fileBuffer, 300);
        const thumbnailKey = fileKey.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.jpg');
        
        const thumbnailResult = await uploadToS3(
          thumbnailBuffer,
          thumbnailKey,
          'image/jpeg',
          {
            originalName: file.name,
            userId,
            folder,
            thumbnail: 'true',
          }
        );

        thumbnailUrl = thumbnailResult.url;
      } catch (error) {
        console.error('Image optimization failed, uploading original:', error);
        // Fallback to original file if optimization fails
        uploadResult = await uploadToS3(
          fileBuffer,
          fileKey,
          file.type,
          {
            originalName: file.name,
            userId,
            folder,
            optimized: 'false',
          }
        );
      }
    } else {
      // Upload non-image files as-is
      uploadResult = await uploadToS3(
        fileBuffer,
        fileKey,
        file.type,
        {
          originalName: file.name,
          userId,
          folder,
          optimized: 'false',
        }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileKey,
        url: uploadResult.url,
        key: uploadResult.key,
        filename: file.name,
        size: uploadResult.size,
        contentType: uploadResult.contentType,
        thumbnailUrl,
        metadata,
        uploadedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
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
    const userId = searchParams.get('userId');
    const folder = searchParams.get('folder') || 'uploads';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would query your database
    // to get the user's uploaded files. For now, we'll return a mock response.
    const mockFiles = [
      {
        id: 'uploads/user123/1640995200000-abc123-sample-image.webp',
        url: 'https://postpal-media.s3.us-east-1.amazonaws.com/uploads/user123/1640995200000-abc123-sample-image.webp',
        filename: 'sample-image.webp',
        size: 245760,
        contentType: 'image/webp',
        thumbnailUrl: 'https://postpal-media.s3.us-east-1.amazonaws.com/uploads/user123/1640995200000-abc123-sample-image_thumb.jpg',
        uploadedAt: '2024-01-01T00:00:00.000Z',
        metadata: {
          width: 1200,
          height: 800,
          format: 'webp',
          optimized: true,
        },
      },
    ];

    return NextResponse.json({
      success: true,
      files: mockFiles,
    });

  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}
