"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadDocument = exports.uploadImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage_service_1 = require("../services/storage.service");
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max global
});
const APP_URL = process.env.APP_URL;
// POST /upload/image
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No se recibió archivo" });
        const key = yield storage_service_1.storageService.uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
        return res.status(200).json({ url: `${APP_URL}/upload/file/${key}` });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});
exports.uploadImage = uploadImage;
// POST /upload/document
const uploadDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No se recibió archivo" });
        const key = yield storage_service_1.storageService.uploadDocument(req.file.buffer, req.file.originalname, req.file.mimetype);
        return res.status(200).json({ url: `${APP_URL}/upload/file/${key}` });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});
exports.uploadDocument = uploadDocument;
// DELETE /upload/file  — body: { url: "https://..." }
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = req.body;
        if (!url)
            return res.status(400).json({ message: "URL requerida" });
        yield storage_service_1.storageService.delete(url);
        return res.status(200).json({ message: "Archivo eliminado" });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});
exports.deleteFile = deleteFile;
