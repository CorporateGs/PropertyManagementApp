// File storage abstraction layer
export interface StorageService {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Blob>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;
  getMetadata(path: string): Promise<StorageMetadata>;
}

export interface StorageMetadata {
  size: number;
  lastModified: Date;
  contentType: string;
  etag?: string;
}

// Local file storage implementation
export class LocalStorage implements StorageService {
  private basePath: string;

  constructor(basePath: string = './uploads') {
    this.basePath = basePath;
  }

  async upload(file: File, path: string): Promise<string> {
    const fs = await import('fs/promises');
    const fullPath = `${this.basePath}/${path}`;

    // Ensure directory exists
    await fs.mkdir(this.basePath, { recursive: true });

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file
    await fs.writeFile(fullPath, buffer);

    return fullPath;
  }

  async download(path: string): Promise<Blob> {
    const fs = await import('fs/promises');
    const fullPath = `${this.basePath}/${path}`;

    const buffer = await fs.readFile(fullPath);
    return new Blob([buffer]);
  }

  async delete(path: string): Promise<void> {
    const fs = await import('fs/promises');
    const fullPath = `${this.basePath}/${path}`;

    try {
      await fs.unlink(fullPath);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(path: string): Promise<boolean> {
    const fs = await import('fs/promises');
    const fullPath = `${this.basePath}/${path}`;

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getSignedUrl(path: string, expiresIn?: number): Promise<string> {
    // For local storage, just return the path
    return `/api/files/${path}`;
  }

  async getMetadata(path: string): Promise<StorageMetadata> {
    const fs = await import('fs/promises');
    const fullPath = `${this.basePath}/${path}`;

    const stats = await fs.stat(fullPath);

    return {
      size: stats.size,
      lastModified: stats.mtime,
      contentType: this.getContentType(path),
    };
  }

  private getContentType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'csv': 'text/csv',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}

// AWS S3 storage implementation
export class S3Storage implements StorageService {
  private s3: any;
  private bucket: string;

  constructor(bucket: string, region: string = 'us-east-1') {
    // TODO: Initialize AWS S3 client
    // const { S3Client } = await import('@aws-sdk/client-s3');
    // this.s3 = new S3Client({ region });
    this.bucket = bucket;
  }

  async upload(file: File, path: string): Promise<string> {
    // TODO: Implement S3 upload
    // const arrayBuffer = await file.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);

    // await this.s3.send(new PutObjectCommand({
    //   Bucket: this.bucket,
    //   Key: path,
    //   Body: buffer,
    //   ContentType: file.type,
    // }));

    return `https://${this.bucket}.s3.amazonaws.com/${path}`;
  }

  async download(path: string): Promise<Blob> {
    // TODO: Implement S3 download
    throw new Error('S3 download not implemented');
  }

  async delete(path: string): Promise<void> {
    // TODO: Implement S3 delete
    throw new Error('S3 delete not implemented');
  }

  async exists(path: string): Promise<boolean> {
    // TODO: Implement S3 exists check
    throw new Error('S3 exists check not implemented');
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    // TODO: Implement S3 signed URL generation
    throw new Error('S3 signed URL generation not implemented');
  }

  async getMetadata(path: string): Promise<StorageMetadata> {
    // TODO: Implement S3 metadata retrieval
    throw new Error('S3 metadata retrieval not implemented');
  }
}

// Google Cloud Storage implementation
export class GCSStorage implements StorageService {
  private storage: any;
  private bucket: string;

  constructor(bucket: string, projectId?: string) {
    // TODO: Initialize Google Cloud Storage client
    // const { Storage } = await import('@google-cloud/storage');
    // this.storage = new Storage({ projectId });
    this.bucket = bucket;
  }

  async upload(file: File, path: string): Promise<string> {
    // TODO: Implement GCS upload
    throw new Error('GCS upload not implemented');
  }

  async download(path: string): Promise<Blob> {
    // TODO: Implement GCS download
    throw new Error('GCS download not implemented');
  }

  async delete(path: string): Promise<void> {
    // TODO: Implement GCS delete
    throw new Error('GCS delete not implemented');
  }

  async exists(path: string): Promise<boolean> {
    // TODO: Implement GCS exists check
    throw new Error('GCS exists check not implemented');
  }

  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    // TODO: Implement GCS signed URL generation
    throw new Error('GCS signed URL generation not implemented');
  }

  async getMetadata(path: string): Promise<StorageMetadata> {
    // TODO: Implement GCS metadata retrieval
    throw new Error('GCS metadata retrieval not implemented');
  }
}

// Storage factory
export function createStorage(type: 'local' | 's3' | 'gcs' = 'local'): StorageService {
  switch (type) {
    case 's3':
      const s3Bucket = process.env.AWS_S3_BUCKET;
      if (!s3Bucket) {
        throw new Error('AWS_S3_BUCKET environment variable is required for S3 storage');
      }
      return new S3Storage(s3Bucket, process.env.AWS_REGION);

    case 'gcs':
      const gcsBucket = process.env.GCS_BUCKET_NAME;
      if (!gcsBucket) {
        throw new Error('GCS_BUCKET_NAME environment variable is required for GCS storage');
      }
      return new GCSStorage(gcsBucket, process.env.GOOGLE_CLOUD_PROJECT_ID);

    case 'local':
    default:
      return new LocalStorage('./uploads');
  }
}

// Generate unique filename
export function generateFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
}

// Validate file before upload
export function validateFile(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
} = {}): void {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options;

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }
}

// Default storage instance
export const storage = createStorage(
  (process.env.STORAGE_TYPE as 'local' | 's3' | 'gcs') || 'local'
);