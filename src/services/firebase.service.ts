import { initializeApp } from 'firebase/app';

import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signInWithCredential,
  AuthCredential,
  User,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyARflXs8OzyMDl6gUaMBmgFFI0E8M8Nso0',
  authDomain: 'async-scrum-collab.firebaseapp.com',
  projectId: 'async-scrum-collab',
  storageBucket: 'async-scrum-collab.appspot.com',
  messagingSenderId: '364156393105',
  appId: '1:364156393105:web:f1dd39e82ab25d311ad130',
  measurementId: 'G-J3YLZS17VE'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
if (/development/i.test(process.env.NODE_ENV)) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}

class FirebaseSevice {
  auth() {
    return auth.currentUser;
  }
  autheticate() {
    return new Promise<User | null>((resolve) => {
      auth.onAuthStateChanged((user) => {
        resolve(user);
      })
    })
  }
  async signout() {
    return signOut(auth);
  }
  async signInWithSession(cred: AuthCredential) {
    return signInWithCredential(auth, cred);
  }
  async signInWithEmailandPass(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }
  async createUserWithEmailPass(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    return cred;
  }
  async updateProfile(displayName: string, photoURL?: string) {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName, photoURL
      })
    }
  }
}

export const firebaseService = new FirebaseSevice();
