import { Router } from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../services/storage.service";
import { upload, uploadImage, uploadDocument, deleteFile } from "../controllers/upload.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Subida
router.post("/image",     upload.single("file"), uploadImage);
router.post("/document",  upload.single("file"), uploadDocument);

// Eliminación
router.delete("/file",  deleteFile);

// Proxy de lectura — público (no requiere auth)
router.get("/file/{*key}", async (req, res) => {
  try {
    const rawKey = (req.params as any).key;
    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;

    const { Body, ContentType } = await s3.send(
      new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME!, Key: key })
    );

    res.setHeader("Content-Type", ContentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    (Body as any).pipe(res);
  } catch {
    res.status(404).json({ message: "Archivo no encontrado" });
  }
});

export default router;