import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Deeksharambh Firebase Client Config
const firebaseConfig = {
  apiKey: "AIzaSyDeeksharambh70SankaraCollegeCSDAKey",
  authDomain: "deeksharambh-70.firebaseapp.com",
  projectId: "deeksharambh-70",
  storageBucket: "deeksharambh-70.firebasestorage.app",
  messagingSenderId: "1092847392819",
  appId: "1:1092847392819:web:deeksharambh70antigravity"
};

let app = null;
let auth = null;
let googleProvider = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (e) {
  console.warn("Firebase initialization notice:", e.message);
}

export { app, auth, googleProvider };

export async function signInWithGoogleFirebase() {
  if (!auth || !googleProvider) {
    throw new Error("Firebase Auth is initializing.");
  }
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();

  return {
    idToken,
    firebaseUid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
}
