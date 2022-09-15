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

import {
  getFirestore,
  collection, doc, getDocs,
  query, where, updateDoc,
  connectFirestoreEmulator,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import { connectStorageEmulator, getDownloadURL, getStorage, ref, uploadBytesResumable, UploadTask } from 'firebase/storage';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

import * as entities from '../entities';
import { firebaseConfig } from './firebase-config';
import { WhereFilterOp } from './firebase-operators';
import { Observable } from 'rxjs';

// Initialize Firebase
const app = initializeApp({
  ...firebaseConfig
});

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const fbStore = getFirestore(app);
const fbDb = getDatabase(app);
const fbStorage = getStorage(app);

if (/development/i.test(process.env.NODE_ENV)) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(fbStore, 'localhost', 8081);
  connectDatabaseEmulator(fbDb, 'localhost', 9000);
  connectStorageEmulator(fbStorage, 'localhost', 9199);
}

const imagesStorageRef = ref(fbStorage, 'images');

type Models = entities.Convo | entities.IProfile |
  entities.IProject | entities.IProject | entities.IIteration |
  entities.DiscussionItem | entities.ICeremony | entities.IMedia | undefined;

const collections = {
  'profiles': () => collection(fbStore, 'profiles'),
  'projects': () => collection(fbStore, 'projects'),
  'iterations': () => collection(fbStore, 'iterations'),
  'ceremonies': () => collection(fbStore, 'ceremonies'),
  'discussions': () => collection(fbStore, 'discussions'),
  'convos': () => collection(fbStore, 'convos'),
  'medias': () => collection(fbStore, 'medias')
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
  async uploadImage(file: File, options?: { task?: UploadTask, path: string }) {
    const fileRef = ref(imagesStorageRef, options?.path || file.name);
    const uploadTask = uploadBytesResumable(fileRef, file);
    if (options) options.task = uploadTask;
    return new Promise<string>((resolve, reject) => {
      uploadTask.then((snap) => {
        resolve(getDownloadURL(snap.ref));
      });
      uploadTask.catch(reject);
    })
  }
  async updateProfile(displayName: string, photoURL?: string) {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName, photoURL
      })
    }
  }
  async get(modelName: ModelName, id: string): Promise<Models> {
    const docRef = doc(fbStore, modelName, id);
    const docSnap = await getDocFromServer(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Models;
    }
    return undefined;
  }
  streamWith<T>(modelName: ModelName, filter: { [field: string]: string } = {}) {
    const { queryRef, collectionRef } = this.getQueryFromFilter(modelName, filter);
    return new Observable<T[]>((subscriber) => {
      onSnapshot(queryRef || collectionRef, {
        complete: () => subscriber.complete(),
        next: (snapshot) => {
          const records = snapshot.docs.map(doc => {
            return { ...doc.data(), id: doc.id } as unknown as T;
          });
          subscriber.next(records);
        },
        error: (err) => subscriber.error(err)
      })
    });
  }
  async findAll(modelName: ModelName, filter: { [field: string]: string } = {}): Promise<Models[]> {
    const { queryRef, collectionRef } = this.getQueryFromFilter(modelName, filter);
    const docsRef = await getDocs(queryRef || collectionRef);
    if (docsRef.empty) {
      return [];
    } else {
      return docsRef.docs.map(d => d.data() as Models);
    }
  }
  private getQueryFromFilter(modelName: ModelName, filter: { [field: string]: string; }) {
    const collectionRef = collections[modelName]();

    const supOps = /(.*) (==|<|<=|>=|!=|in)$/;
    const conditions = Object.keys(filter)
      .filter(f => typeof filter[f] !== 'undefined')
      .map(f => {
        const match = supOps.exec(f);
        if (match) {
          const OPERAND = 1, OPERATOR = 2;
          const operand = match[OPERAND];
          const operator = match[OPERATOR] as WhereFilterOp;
          return where(operand, operator, filter[f]);
        }
        return where(f, '==', filter[f]);
      });
    const queryRef = conditions.length > 0 && query(collectionRef, ...conditions);
    return { queryRef, collectionRef };
  }

  async create(modelName: ModelName, value: Models) {
    if (value) {
      const docRef = doc(fbStore, modelName + '/' + value.key);
      await setDoc(docRef, value);
    }
    return value;
  }
  async update(modelName: ModelName, id: string, value: Models) {
    const docRef = doc(fbStore, modelName, id);
    if (value) {
      await updateDoc(docRef, {
        ...value
      });
    }
  }
  async delete(modelName: ModelName, id: string) {
    const docRef = doc(fbStore, modelName, id);
    await deleteDoc(docRef);
  }
  async deleteCollection(modelName: ModelName) {
    const batch = writeBatch(fbStore);
    const docRef = doc(fbStore, modelName);
    batch.delete(docRef);
    return batch.commit();
  }

}

export const firebaseService = new FirebaseSevice();
