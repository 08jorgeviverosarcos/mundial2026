import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Configuration should be provided via environment variables in a real build environment.
// For this simulator, we try to use env vars, but fail gracefully if not present.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
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