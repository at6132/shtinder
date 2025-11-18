import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor() {
    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      this.logger.warn('⚠️ Cloudinary credentials not configured. Image uploads will fail.');
    } else {
      this.logger.log('✅ Cloudinary configured successfully');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new Error('Invalid file provided');
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary credentials not configured');
    }

    try {
      this.logger.log(`📤 Uploading file to Cloudinary: ${file.originalname}`);

      // Convert buffer to stream
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'shtinder/photos',
            resource_type: 'auto',
            format: 'jpg', // Auto-convert to JPG for optimization
            quality: 'auto',
            fetch_format: 'auto',
          },
          (error, result) => {
            if (error) {
              this.logger.error(`❌ Failed to upload file to Cloudinary: ${error.message}`, error);
              reject(new Error(`Failed to upload file: ${error.message}`));
            } else {
              this.logger.log(`✅ File uploaded successfully: ${result.secure_url}`);
              resolve(result.secure_url);
            }
          },
        );

        stream.pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error(`❌ Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(url: string): Promise<void> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary credentials not configured');
    }

    try {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
      const urlParts = url.split('/upload/');
      if (urlParts.length < 2) {
        throw new Error('Invalid Cloudinary URL format');
      }

      // Get the path after /upload/ and remove version and extension
      const pathAfterUpload = urlParts[1];
      const publicId = pathAfterUpload
        .split('/')
        .slice(1) // Remove version (v1234567890)
        .join('/')
        .replace(/\.[^/.]+$/, ''); // Remove file extension

      this.logger.log(`🗑️ Deleting file from Cloudinary: ${publicId}`);
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        this.logger.log(`✅ File deleted successfully: ${publicId}`);
      } else {
        this.logger.warn(`⚠️ File deletion result: ${result.result}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to delete file from Cloudinary: ${error.message}`, error.stack);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}

