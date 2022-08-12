import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection, doc, getDocs,
  query, where, updateDoc,
  connectFirestoreEmulator,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
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

import * as entities from '../entities';
import { firebaseConfig } from './firebase-config';
import { WhereFilterOp } from './firebase-operators';

// Initialize Firebase
const app = initializeApp({
  ...firebaseConfig
});
const db = getFirestore(app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
if (/development/i.test(process.env.NODE_ENV)) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8081);
}
type Models = entities.Convo | entities.IProfile |
  entities.IProject | entities.IProject | entities.IIteration |
  entities.DiscussionItem | entities.ICeremony | entities.IMedia | undefined;

const collections = {
  'profiles': () => collection(db, 'profiles'),
  'projects': () => collection(db, 'projects'),
  'iterations': () => collection(db, 'iterations'),
  'ceremonies': () => collection(db, 'ceremonies'),
  'discussions': () => collection(db, 'discussions'),
  'convos': () => collection(db, 'convos'),
  'medias': () => collection(db, 'medias')
};
type Colls = typeof collections;
type ModelName = keyof Colls;
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
  async get(modelName: ModelName, id: string): Promise<Models> {
    const docRef = doc(db, modelName, id);
    const docSnap = await getDocFromServer(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Models;
    }
    return undefined;
  }
  async findAll(modelName: ModelName, filter: { [field: string]: string } = {}): Promise<Models[]> {
    const collectionRef = collections[modelName]();
    const supOps = /(.*) (==|<|<=|>=|!=|in)$/;
    const conditions = Object.keys(filter).map(f => {
      const match = supOps.exec(f);
      if (match) {
        const OPERAND = 1, OPERATOR = 2;
        const operand = match[OPERAND];
        const operator = match[OPERATOR] as WhereFilterOp;
        return where(operand, operator, filter[f]);
      }
      return where(f, '==', filter[f])
    })
    const queryRef = conditions.length > 0 && query(collectionRef, ...conditions);
    const docsRef = await getDocs(queryRef || collectionRef);
    if (docsRef.empty) {
      return [];
    } else {
      return docsRef.docs.map(d => d.data() as Models);
    }
  }
  async create(modelName: ModelName, value: Models) {
    if (value) {
      const docRef = doc(db, modelName + '/' + value.key);
      await setDoc(docRef, value);
    }
    return value;
  }
  async update(modelName: ModelName, id: string, value: Models) {
    const docRef = doc(db, modelName, id);
    if (value) {
      await updateDoc(docRef, {
        ...value
      });
    }
  }
  async delete(modelName: ModelName, id: string) {
    const docRef = doc(db, modelName, id);
    await deleteDoc(docRef);
  }
  async deleteCollection(modelName: ModelName) {
    const batch = writeBatch(db);
    const docRef = doc(db, modelName);
    batch.delete(docRef);
    return batch.commit();
  }
}

export const firebaseService = new FirebaseSevice();
