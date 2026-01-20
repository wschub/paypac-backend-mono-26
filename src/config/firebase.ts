import admin from 'firebase-admin';

/**
 * Inicialización de Firebase Admin SDK
 * 
 * Soporta múltiples métodos de autenticación:
 * 1. Application Default Credentials (desarrollo local con gcloud)
 * 2. Workload Identity (producción en Google Cloud)
 * 3. Service Account Key (si está disponible)
 */

if (!admin.apps.length) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasServiceAccountKey = process.env.FIREBASE_PRIVATE_KEY;

  if (hasServiceAccountKey) {
    // Método 1: Usar clave de cuenta de servicio (si está disponible)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
    });
    console.log('✅ Firebase inicializado con Service Account Key');
  } else if (isDevelopment) {
    // Método 2: Application Default Credentials (desarrollo local)
    // Requiere: gcloud auth application-default login
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('✅ Firebase inicializado con Application Default Credentials');
  } else {
    // Método 3: Workload Identity (producción en Google Cloud)
    // Cloud Run, Cloud Functions, App Engine usan automáticamente la identidad del servicio
    admin.initializeApp();
    console.log('✅ Firebase inicializado con Workload Identity');
  }
}

export const firebaseAuth = admin.auth();
export const firebaseAdmin = admin;