import sharp from 'sharp';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface OptimizedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Optimize and resize an image
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  const {
    width = 1200,
    height = 1200,
    quality = 85,
    format = 'webp',
    fit = 'inside',
  } = options;

  try {
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    // Resize the image
    const resizedImage = image.resize(width, height, {
      fit,
      withoutEnlargement: true,
    });

    // Convert format and apply quality
    let processedImage = resizedImage;
    
    switch (format) {
      case 'jpeg':
        processedImage = resizedImage.jpeg({ quality });
        break;
      case 'png':
        processedImage = resizedImage.png({ quality });
        break;
      case 'webp':
        processedImage = resizedImage.webp({ quality });
        break;
    }

    const buffer = await processedImage.toBuffer();
    const optimizedMetadata = await sharp(buffer).metadata();

    return {
      buffer,
      width: optimizedMetadata.width || width,
      height: optimizedMetadata.height || height,
      format: optimizedMetadata.format || format,
      size: buffer.length,
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error('Failed to optimize image');
  }
}

/**
 * Generate multiple image sizes for responsive images
 */
export async function generateImageSizes(
  inputBuffer: Buffer,
  sizes: Array<{ width: number; height?: number; suffix: string }>
): Promise<Array<{ buffer: Buffer; suffix: string; width: number; height: number }>> {
  try {
    const results = await Promise.all(
      sizes.map(async ({ width, height, suffix }) => {
        const optimized = await optimizeImage(inputBuffer, {
          width,
          height,
          quality: 85,
          format: 'webp',
          fit: 'cover',
        });

        return {
          buffer: optimized.buffer,
          suffix,
          width: optimized.width,
          height: optimized.height,
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Error generating image sizes:', error);
    throw new Error('Failed to generate image sizes');
  }
}

/**
 * Create a thumbnail image
 */
export async function createThumbnail(
  inputBuffer: Buffer,
  size: number = 300
): Promise<Buffer> {
  try {
    const optimized = await optimizeImage(inputBuffer, {
      width: size,
      height: size,
      quality: 80,
      format: 'jpeg',
      fit: 'cover',
    });

    return optimized.buffer;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw new Error('Failed to create thumbnail');
  }
}

/**
 * Extract image metadata
 */
export async function extractImageMetadata(buffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
}> {
  try {
    const metadata = await sharp(buffer).metadata();
    
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
      hasAlpha: metadata.hasAlpha || false,
    };
  } catch (error) {
    console.error('Error extracting image metadata:', error);
    throw new Error('Failed to extract image metadata');
  }
}

/**
 * Convert image to different formats
 */
export async function convertImageFormat(
  inputBuffer: Buffer,
  targetFormat: 'jpeg' | 'png' | 'webp',
  quality: number = 85
): Promise<Buffer> {
  try {
    let processedImage = sharp(inputBuffer);

    switch (targetFormat) {
      case 'jpeg':
        processedImage = processedImage.jpeg({ quality });
        break;
      case 'png':
        processedImage = processedImage.png({ quality });
        break;
      case 'webp':
        processedImage = processedImage.webp({ quality });
        break;
    }

    return await processedImage.toBuffer();
  } catch (error) {
    console.error('Error converting image format:', error);
    throw new Error('Failed to convert image format');
  }
}
