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
exports.configManager = void 0;
const crypto_1 = __importDefault(require("crypto"));
class ConfigManager {
    constructor() {
        const mode = process.env.WOMPI_MODE;
        if (!mode) {
            throw new Error("La variable de entorno WOMPI_MODE no está definida. Asegúrate de configurarla en el archivo .env.");
        }
        this.mode = mode;
    }
    // Singleton: Asegura que solo haya una instancia de ConfigManager
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getEnvironmentMode() {
        return this.mode;
    }
    // Obtener la URL base de Wompi
    getWompiUrl() {
        return this.mode === "sandbox"
            ? process.env.WOMPI_URL_SANDBOX || "" // Valor para producción. 
            : process.env.WOMPI_URL_PRODUCTION || ""; // Valor para sandbox
    }
    getSignature(reference, amount, currency, expiration_date) {
        return __awaiter(this, void 0, void 0, function* () {
            const integritySecret = this.mode === "sandbox"
                ? process.env.TEST_INTEGRITY
                : process.env.PRV_INTEGRITY;
            if (!integritySecret) {
                throw new Error(`La variable de entorno ${this.mode === "sandbox" ? "TEST_INTEGRITY" : "PRV_INTEGRITY"} no está definida. Asegúrate de configurarla en el archivo .env.`);
            }
            // Obtener la fecha actual en segundos y sumarle 15 minutos
            // const expirationTimestamp = Math.floor(Date.now() / 1000) + 15 * 60;
            const dataToSign = reference + amount.toString() + currency + expiration_date + integritySecret;
            console.log("dataToSign: ", dataToSign);
            const encondedText = new TextEncoder().encode(dataToSign);
            const hashBuffer = yield crypto_1.default.subtle.digest("SHA-256", encondedText);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
            return hashHex;
        });
    }
    // 1 MERCHANTS
    getWompiTokenAcceptance() {
        const pubTest = this.mode === "sandbox"
            ? process.env.PUB_TEST
            : process.env.PUB_PRO;
        if (!pubTest) {
            throw new Error(`La variable de entorno ${this.mode === "sandbox" ? "PUB_TEST" : "PUB_PRO"} no está definida. Asegúrate de configurarla en el archivo .env.`);
        }
        return `merchants/${pubTest}`;
    }
    //2 payment_sources
    paymentSources() {
        const pubTest = this.mode === "sandbox"
            ? process.env.PRV_TEST
            : process.env.PRV_PRO;
        if (!pubTest) {
            throw new Error(`La variable de entorno ${this.mode === "sandbox" ? "PRV_TEST" : "PRV_PRO"} no está definida. Asegúrate de configurarla en el archivo .env.`);
        }
        return pubTest;
    }
}
// Exportar una instancia global para usar en todo el proyecto
exports.configManager = ConfigManager.getInstance();
