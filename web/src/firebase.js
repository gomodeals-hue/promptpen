import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyC1God6pfIRSivI9hmVy0xmn2NBb54uOF8",
  authDomain: "ink-app-5722a.firebaseapp.com",
  projectId: "ink-app-5722a",
  storageBucket: "ink-app-5722a.firebasestorage.app",
  messagingSenderId: "987751854589",
  appId: "1:987751854589:web:1b94ab6dacc85eecd3a994",
  measurementId: "G-YVH52KEG5R"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()