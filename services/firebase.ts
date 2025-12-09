import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Safely access env vars
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

// Configuration should be provided via environment variables in a real build environment.
const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
  measurementId: getEnv('FIREBASE_MEASUREMENT_ID')
};

let analytics: any = null;

try {
    // Check if at least apiKey is present before initializing to avoid errors in console if config is missing
    if (firebaseConfig.apiKey) {
        const app = initializeApp(firebaseConfig);
        analytics = getAnalytics(app);
        console.log("Firebase initialized successfully");
    } else {
        console.log("Firebase config missing. Events will be logged to console only.");
    }
} catch (e) {
    console.warn("Firebase initialization failed:", e);
}

export const logAppEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    } else {
      // Fallback logging for development debugging
      console.log(`[Event Tracked]: ${eventName}`, params);
    }
  } catch (e) {
    console.error("Error logging event:", e);
  }
};