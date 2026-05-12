// firebase-config.js — Placeholder.
//
// Hoy la app corre 100% local: tenant-loader.js lee JSON de /tenants/{id}/.
// Firebase no se inicializa.
//
// Cuando crees el proyecto:
// 1) Firebase Console → Project Settings → tu app web → copiá el objeto config.
// 2) Reemplazá los valores 'REEMPLAZAR_*' de abajo.
// 3) Cambiá FIREBASE_ENABLED a true.
// 4) Reemplazá tenant-loader.js para que loadTenant() consulte Firestore
//    en /tenants/{tenantId}/info + /tenants/{tenantId}/events (filtro archived=false).
// 5) IMPORTANTE: nunca commitear este archivo con keys reales si el repo es público.
//    Usar variables de entorno de Cloudflare Pages y reemplazar al build.

export const firebaseConfig = {
    apiKey:            'REEMPLAZAR_AL_CREAR_PROYECTO',
    authDomain:        'REEMPLAZAR.firebaseapp.com',
    projectId:         'REEMPLAZAR',
    storageBucket:     'REEMPLAZAR.appspot.com',
    messagingSenderId: 'REEMPLAZAR',
    appId:             'REEMPLAZAR'
};

export const FIREBASE_ENABLED = false;
