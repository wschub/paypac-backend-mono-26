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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.s3 = void 0;
exports.extractKeyFromUrl = extractKeyFromUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
exports.s3 = new client_s3_1.S3Client({
    endpoint: process.env.AWS_ENDPOINT_URL,
    region: (_a = process.env.AWS_DEFAULT_REGION) !== null && _a !== void 0 ? _a : "auto",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});
const BUCKET = process.env.AWS_S3_BUCKET_NAME;
// ── Helpers ────────────────────────────────────────────
/** Extrae el key del bucket desde la URL del proxy */
function extractKeyFromUrl(url) {
    try {
        // URL: https://backend.railway.app/api/upload/image/logos/uuid.png
        const match = url.match(/\/api\/upload\/[^/]+\/(.+)$/);
        return match ? match[1] : null;
    }
    catch (_a) {
        return null;
    }
}
// ── Métodos públicos ───────────────────────────────────
exports.storageService = {
    upload(buffer, originalName, mimeType, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { folder, allowedTypes, maxSizeMB = 10 } = options;
            if (!allowedTypes.includes(mimeType)) {
                throw new Error(`Tipo no permitido. Permitidos: ${allowedTypes.join(", ")}`);
            }
            if (buffer.length > maxSizeMB * 1024 * 1024) {
                throw new Error(`Archivo excede el límite de ${maxSizeMB}MB`);
            }
            const ext = path_1.default.extname(originalName);
            const key = `${folder}/${(0, crypto_1.randomUUID)()}${ext}`;
            yield exports.s3.send(new client_s3_1.PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
            }));
            return key;
        });
    },
    delete(keyOrUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            // Acepta tanto el key directo como la URL completa del proxy
            const key = keyOrUrl.startsWith("http")
                ? extractKeyFromUrl(keyOrUrl)
                : keyOrUrl;
            if (!key) {
                console.warn("⚠️ No se pudo extraer el key para eliminar:", keyOrUrl);
                return;
            }
            yield exports.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
            console.log("🗑️ Archivo eliminado del bucket:", key);
        });
    },
    // Shortcuts semánticos
    uploadImage(buffer, originalName, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.upload(buffer, originalName, mimeType, {
                folder: "logos",
                allowedTypes: ["image/jpeg", "image/png", "image/webp"],
                maxSizeMB: 5,
            });
        });
    },
    uploadDocument(buffer, originalName, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.upload(buffer, originalName, mimeType, {
                folder: "documents",
                allowedTypes: [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ],
                maxSizeMB: 20,
            });
        });
    },
};
