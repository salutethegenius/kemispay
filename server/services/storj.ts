import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface UploadFileParams {
  vendorId: string;
  fileName: string;
  fileData: string; // base64 encoded
  documentType: string;
}

class StorjService {
  private s3Client: S3Client;
  private bucketName = 'kemispay-node-01';

  constructor() {
    if (!process.env.STORJ_ACCESS_KEY_ID || !process.env.STORJ_SECRET_ACCESS_KEY) {
      throw new Error('Missing required Storj credentials: STORJ_ACCESS_KEY_ID and STORJ_SECRET_ACCESS_KEY');
    }

    this.s3Client = new S3Client({
      endpoint: 'https://gateway.storjshare.io',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.STORJ_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORJ_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });

    console.log('StorjService initialized with S3 Gateway credentials');
  }

  async uploadFile({ vendorId, fileName, fileData, documentType }: UploadFileParams): Promise<string> {
    try {
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${vendorId}/${documentType}/${timestamp}_${sanitizedFileName}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: Buffer.from(fileData, 'base64'),
        ContentType: this.getContentType(fileName),
        Metadata: {
          vendorId,
          documentType,
          originalFileName: fileName,
          uploadDate: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);
      console.log(`File uploaded to Storj: ${key}`);
      
      return key;
    } catch (error: any) {
      console.error('Storj upload error:', error);
      throw new Error(`Failed to upload file to Storj: ${error.message}`);
    }
  }

  async downloadFile(storjPath: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storjPath,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('No file data received');
      }

      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error: any) {
      console.error('Storj download error:', error);
      throw new Error(`Failed to download file from Storj: ${error.message}`);
    }
  }

  async deleteFile(storjPath: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: storjPath,
      });

      await this.s3Client.send(command);
      console.log(`File deleted from Storj: ${storjPath}`);
    } catch (error: any) {
      console.error('Storj delete error:', error);
      throw new Error(`Failed to delete file from Storj: ${error.message}`);
    }
  }

  async getSignedUrl(storjPath: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storjPath,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { 
        expiresIn: 3600 // 1 hour
      });
      
      return signedUrl;
    } catch (error: any) {
      console.error('Storj signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  private getContentType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const contentTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}

export const storjService = new StorjService();
