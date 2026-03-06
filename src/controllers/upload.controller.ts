import { Request, Response } from "express";
import multer from "multer";
import { storageService, StorageFolder } from "../services/storage.service";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max global
});

const APP_URL = process.env.APP_URL!;

// POST /upload/image
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se recibió archivo" });
    const key = await storageService.uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
    return res.status(200).json({ url: `${APP_URL}/upload/file/${key}` });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// POST /upload/document
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se recibió archivo" });
    const key = await storageService.uploadDocument(req.file.buffer, req.file.originalname, req.file.mimetype);
    return res.status(200).json({ url: `${APP_URL}/upload/file/${key}` });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// DELETE /upload/file  — body: { url: "https://..." }
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL requerida" });
    await storageService.delete(url);
    return res.status(200).json({ message: "Archivo eliminado" });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};