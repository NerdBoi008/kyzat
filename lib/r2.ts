import { S3Client } from '@aws-sdk/client-s3';

// Initialize R2 client (S3-compatible)
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Helper to generate unique filename
export function generateFileName(originalName: string, userId: string, userName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);

  const userNameSanitized = userName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  
  // Extract extension
  // const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Remove extension from original name and sanitize
  const nameWithoutExt = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
    .substring(0, 30); // Limit length
  
  // Generate clean filename: name-timestamp-random.ext
  return `products/${userNameSanitized ? userNameSanitized+'-'+userId : userId}/${nameWithoutExt}-${timestamp}-${randomString}.webp`;
}
