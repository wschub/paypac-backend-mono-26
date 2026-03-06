import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

export const s3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION ?? "auto",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

// ── Tipos ──────────────────────────────────────────────
export type StorageFolder = "logos" | "documents" | "avatars" | "events";

interface UploadOptions {
  folder: StorageFolder;
  allowedTypes: string[];   // ["image/jpeg", "image/png"] | ["application/pdf", ...]
  maxSizeMB?: number;
}

// ── Helpers ────────────────────────────────────────────

/** Extrae el key del bucket desde la URL del proxy */
export function extractKeyFromUrl(url: string): string | null {
  try {
    // URL: https://backend.railway.app/api/upload/image/logos/uuid.png
    const match = url.match(/\/api\/upload\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ── Métodos públicos ───────────────────────────────────
export const storageService = {

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    options: UploadOptions
  ): Promise<string> {
    const { folder, allowedTypes, maxSizeMB = 10 } = options;

    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`Tipo no permitido. Permitidos: ${allowedTypes.join(", ")}`);
    }

    if (buffer.length > maxSizeMB * 1024 * 1024) {
      throw new Error(`Archivo excede el límite de ${maxSizeMB}MB`);
    }

    const ext = path.extname(originalName);
    const key = `${folder}/${randomUUID()}${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));

    return key;
  },

  async delete(keyOrUrl: string): Promise<void> {
    // Acepta tanto el key directo como la URL completa del proxy
    const key = keyOrUrl.startsWith("http")
      ? extractKeyFromUrl(keyOrUrl)
      : keyOrUrl;

    if (!key) {
      console.warn("⚠️ No se pudo extraer el key para eliminar:", keyOrUrl);
      return;
    }

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    console.log("🗑️ Archivo eliminado del bucket:", key);
  },

  // Shortcuts semánticos
  async uploadImage(buffer: Buffer, originalName: string, mimeType: string) {
    return this.upload(buffer, originalName, mimeType, {
      folder: "logos",
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxSizeMB: 5,
    });
  },

  async uploadDocument(buffer: Buffer, originalName: string, mimeType: string) {
    return this.upload(buffer, originalName, mimeType, {
      folder: "documents",
      allowedTypes: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      maxSizeMB: 20,
    });
  },
};