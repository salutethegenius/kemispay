import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface UploadFileParams {
  userId: string;
  fileName: string;
  fileData: string; // base64 encoded
  documentType: string;
}

class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName = "kemispaykyc";

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new Error(
        "Missing required Supabase credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    this.supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
    console.log("SupabaseStorageService initialized");
  }

  async uploadFile({
    userId,
    fileName,
    fileData,
    documentType,
  }: UploadFileParams): Promise<string> {
    try {
      const timestamp = Date.now();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${userId}/${documentType}/${timestamp}_${sanitizedFileName}`;

      const buffer = Buffer.from(fileData, "base64");
      const contentType = this.getContentType(fileName);

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(path, buffer, {
          contentType,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      console.log(`File uploaded to Supabase storage: ${path}`);
      return path;
    } catch (error: any) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async downloadFile(path: string): Promise<Buffer> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .download(path);

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No file data received");
      }

      return Buffer.from(await data.arrayBuffer());
    } catch (error: any) {
      console.error("Supabase download error:", error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        throw error;
      }
      console.log(`File deleted from Supabase storage: ${path}`);
    } catch (error: any) {
      console.error("Supabase delete error:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error("Failed to generate signed URL");
      }

      return data.signedUrl;
    } catch (error: any) {
      console.error("Supabase signed URL error:", error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  private getContentType(fileName: string): string {
    const ext = fileName.toLowerCase().split(".").pop();
    const contentTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      doc: "application/msword",
      docx:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    return contentTypes[ext || ""] || "application/octet-stream";
  }
}

function createSupabaseStorageService(): SupabaseStorageService | null {
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null;
  }
  try {
    return new SupabaseStorageService();
  } catch {
    return null;
  }
}

export const supabaseStorageService = createSupabaseStorageService();
