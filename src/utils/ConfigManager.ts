import crypto from 'crypto';

class ConfigManager {
  private static instance: ConfigManager;
  private mode: string;

  private constructor() {
    const mode = process.env.WOMPI_MODE;

    if (!mode) {
      throw new Error("La variable de entorno WOMPI_MODE no está definida. Asegúrate de configurarla en el archivo .env.");
    }
  
    this.mode = mode;
  }

  // Singleton: Asegura que solo haya una instancia de ConfigManager
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getEnvironmentMode(): string {
    return this.mode;
  }

  // Obtener la URL base de Wompi
  public getWompiUrl(): string {
    return this.mode === "sandbox"
      ? process.env.WOMPI_URL_SANDBOX || "" // Valor para producción. 
      : process.env.WOMPI_URL_PRODUCTION || "";   // Valor para sandbox
  }
  
  public async getSignature(
    reference: string,
    amount: number,
    currency: string,
    expiration_date:string
    
  ): Promise<string> {

    const integritySecret =
      this.mode === "sandbox"  
        ? process.env.TEST_INTEGRITY 
        : process.env.PRV_INTEGRITY; 
  
    if (!integritySecret) {
      throw new Error(
        `La variable de entorno ${
          this.mode === "sandbox" ? "TEST_INTEGRITY" : "PRV_INTEGRITY"
        } no está definida. Asegúrate de configurarla en el archivo .env.`
      );
    }
  
  
    // Obtener la fecha actual en segundos y sumarle 15 minutos
   // const expirationTimestamp = Math.floor(Date.now() / 1000) + 15 * 60;

   
    const dataToSign = reference+amount.toString()+currency+expiration_date+integritySecret;
    
    console.log("dataToSign: ",dataToSign);

      const encondedText = new TextEncoder().encode(dataToSign);
      const hashBuffer = await crypto.subtle.digest("SHA-256", encondedText);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); 

      return hashHex; 
  }

  // 1 MERCHANTS
  public getWompiTokenAcceptance(): string {
    const pubTest =
      this.mode === "sandbox"  
        ? process.env.PUB_TEST
        : process.env.PUB_PRO;
  
    if (!pubTest) {
      throw new Error(
        `La variable de entorno ${
          this.mode === "sandbox" ? "PUB_TEST" : "PUB_PRO"
        } no está definida. Asegúrate de configurarla en el archivo .env.`
      );
    }
  
    return `merchants/${pubTest}`;
  }

  //2 payment_sources
  public paymentSources(): string {
    const pubTest =
      this.mode === "sandbox"  
        ? process.env.PRV_TEST
        : process.env.PRV_PRO;
  
    if (!pubTest) {
      throw new Error(
        `La variable de entorno ${
          this.mode === "sandbox" ? "PRV_TEST" : "PRV_PRO"
        } no está definida. Asegúrate de configurarla en el archivo .env.`
      );
    }
  
    return pubTest;
  }

  
 
  

 
}

// Exportar una instancia global para usar en todo el proyecto
export const configManager = ConfigManager.getInstance();


