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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_s3_1 = require("@aws-sdk/client-s3");
const storage_service_1 = require("../services/storage.service");
const upload_controller_1 = require("../controllers/upload.controller");
const router = (0, express_1.Router)();
// Subida
router.post("/image", upload_controller_1.upload.single("file"), upload_controller_1.uploadImage);
router.post("/document", upload_controller_1.upload.single("file"), upload_controller_1.uploadDocument);
// Eliminación
router.delete("/file", upload_controller_1.deleteFile);
// Proxy de lectura — público (no requiere auth)
router.get("/file/{*key}", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawKey = req.params.key;
        const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
        const { Body, ContentType } = yield storage_service_1.s3.send(new client_s3_1.GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: key }));
        res.setHeader("Content-Type", ContentType || "application/octet-stream");
        res.setHeader("Cache-Control", "public, max-age=31536000");
        Body.pipe(res);
    }
    catch (_a) {
        res.status(404).json({ message: "Archivo no encontrado" });
    }
}));
exports.default = router;
