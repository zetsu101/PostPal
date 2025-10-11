import { NextRequest } from 'next/server';
import { SocialMediaAPIService } from '@/lib/socialMediaAPI';
import { APIResponse, createValidationMiddleware, validationSchemas, requireAuth } from '@/lib/api-middleware';

/**
 * @swagger
 * /api/social/instagram:
 *   post:
 *     summary: Post content to Instagram
 *     tags: [Social Media]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - accessToken
 *               - businessAccountId
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2200
 *                 example: "Check out our latest AI-powered content! 🚀"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/image.jpg"
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["#AI", "#SocialMedia", "#Content"]
 *               accessToken:
 *                 type: string
 *                 example: "your_instagram_access_token"
 *               businessAccountId:
 *                 type: string
 *                 example: "your_business_account_id"
 *     responses:
 *       200:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         postId:
 *                           type: string
 *                           example: "instagram_post_123"
 *                         url:
 *                           type: string
 *                           example: "https://www.instagram.com/p/ABC123/"
 *       400:
 *         description: Bad request or missing credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const auth = requireAuth(request);
    if (!auth.success) {
      return APIResponse.unauthorized(auth.error);
    }

    // Validate request body
    const body = await request.json();
    const validationSchema = validationSchemas.postContent.extend({
      accessToken: validationSchemas.postContent.shape.text,
      businessAccountId: validationSchemas.postContent.shape.text,
    });

    const validation = createValidationMiddleware(validationSchema)(request);
    if (!validation.success) {
      return APIResponse.validationError(validation.errors);
    }

    const { text, imageUrl, hashtags, accessToken, businessAccountId } = body;

    if (!accessToken || !businessAccountId) {
      return APIResponse.error('Missing Instagram credentials: accessToken and businessAccountId are required');
    }

    console.log('📸 Instagram API route called');
    
    const socialMediaService = new SocialMediaAPIService({
      instagram: { accessToken, businessAccountId, userId: '' },
    });

    const result = await socialMediaService.postToInstagram({ text, imageUrl, hashtags });

    if (!result.success) {
      console.error('❌ Instagram post failed:', result.error);
      return APIResponse.error(`Instagram post failed: ${result.error}`, 400);
    }

    return APIResponse.success({
      postId: result.postId,
      url: result.url,
      platform: 'instagram',
      timestamp: result.timestamp,
    }, 'Instagram post created successfully');
  } catch (error: any) {
    console.error('Instagram API route error:', error);
    return APIResponse.serverError('Failed to post to Instagram', error);
  }
}
