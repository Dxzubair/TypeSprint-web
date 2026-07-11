/* v8 ignore start */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

let auth: any = null;
let db: any = null;
let storage: any = null;
let isFirebaseEnabled = false;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
        db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    }, firebaseConfig.firestoreDatabaseId || '(default)');
    storage = getStorage(app);
    isFirebaseEnabled = true;

    // Validate connection to Firestore on boot as mandated by security skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection test: Successfully connected & read test document.");
      } catch (error: any) {
        const code = error?.code;
        const msg = error?.message || '';
        if (code === 'permission-denied') {
          console.log("Firestore connection test: Online & Secured. (Permission denied on test path as expected).");
        } else if (msg.toLowerCase().includes('offline') || code === 'unavailable') {
          console.error("Please check your Firebase configuration. Firestore client is offline or unavailable.");
        } else {
          console.warn(`Firestore connection check result: ${code || 'unknown'} - ${msg}`);
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error('Failed to initialize Firebase SDK', err);
  }
} else {
  console.warn('Firebase configuration is missing or incomplete in firebase-applet-config.json');
}

export { auth, db, storage, isFirebaseEnabled, GoogleAuthProvider };
/* v8 ignore stop */
