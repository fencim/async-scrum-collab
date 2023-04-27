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
  signOut,
  GoogleAuthProvider,
  signInWithPopup
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
import { getDatabase, connectDatabaseEmulator, ref as refDb, onValue } from 'firebase/database';

import * as entities from '../entities';
import { firebaseConfig } from './firebase-config';
import { WhereFilterOp } from './firebase-operators';
import { Observable, Subject, retry } from 'rxjs';

export enum AccessStatus {
  offline = 1,
  online = 2,
  authorized = 4,
  unAuthorized = 8,
  expired = 16
}

// Initialize Firebase
const app = initializeApp({
  ...firebaseConfig,

});

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const fbStore = getFirestore(app);
const fbDb = getDatabase(app);
const fbStorage = getStorage(app);

const googleProvider = new GoogleAuthProvider();

if (/development/i.test(process.env.NODE_ENV)) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(fbStore, 'localhost', 8081);
  connectDatabaseEmulator(fbDb, 'localhost', 9000);
  connectStorageEmulator(fbStorage, 'localhost', 9199);
}

const imagesStorageRef = ref(fbStorage, 'images');

type Models = entities.Convo | entities.IProfile | entities.IOnlineUser |
  entities.IProject | entities.IProject | entities.IIteration |
  entities.DiscussionItem | entities.ICeremony | entities.IMedia |
  entities.IActivityLog | undefined;

const collections = {
  'profiles': () => collection(fbStore, 'profiles'),
  'projects': () => collection(fbStore, 'projects'),
  'iterations': () => collection(fbStore, 'iterations'),
  'ceremonies': () => collection(fbStore, 'ceremonies'),
  'discussions': () => collection(fbStore, 'discussions'),
  'convos': () => collection(fbStore, 'convos'),
  'medias': () => collection(fbStore, 'medias'),
  'online': () => collection(fbStore, 'online-users'),
  'logs': () => collection(fbStore, 'logs')
};
type Colls = typeof collections;
type ModelName = keyof Colls;
class FirebaseSevice {
  constructor() {
    this.accessObs = new Subject();
    const connRef = refDb(fbDb, '.info/connected');
    onValue(connRef, (snap) => {
      if (snap.val() === true) {
        this.setAccessStatus(AccessStatus.online);
      } else {
        this.setAccessStatus(AccessStatus.offline);
      }
    })

  }
  private accessObs?: Subject<AccessStatus>;
  accessStatus = AccessStatus.online;
  setAccessStatus(value: AccessStatus) {
    if (value & AccessStatus.offline) {
      this.accessStatus = this.accessStatus ^ AccessStatus.online;
    } else if (value & AccessStatus.online) {
      this.accessStatus = this.accessStatus | AccessStatus.online
    }
    if (value & AccessStatus.unAuthorized) {
      this.accessStatus = this.accessStatus ^ AccessStatus.authorized;
    } else if (value & AccessStatus.authorized) {
      this.accessStatus = this.accessStatus | AccessStatus.authorized
    }
    this.accessObs?.next(value | this.accessStatus);
  }
  subscribe(cb: (online: AccessStatus) => void) {
    this.accessObs?.subscribe(cb);
  }
  auth() {
    return auth.currentUser;
  }
  autheticate() {
    return new Promise<User | null>((resolve) => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          this.setAccessStatus(AccessStatus.authorized);
        } else {
          this.setAccessStatus(AccessStatus.unAuthorized);
        }
        resolve(user);
      })
    })
  }
  async signout() {
    this.setAccessStatus(AccessStatus.unAuthorized);
    return signOut(auth);
  }
  async signInWithSession(cred: AuthCredential) {
    const res = await signInWithCredential(auth, cred);
    res && this.setAccessStatus(AccessStatus.authorized);
    return res;
  }
  async signInWithEmailandPass(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }
  async signInWithGoolgeAccount() {
    const res = await signInWithPopup(auth, googleProvider);
    this.setAccessStatus(AccessStatus.authorized);
    return res;
  }
  async createUserWithEmailPass(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    this.setAccessStatus(AccessStatus.authorized);
    return cred;
  }
  async uploadImage(file: File, options?: { task?: UploadTask, path: string }) {
    const fileRef = ref(imagesStorageRef, options ? `${options.path}/${file.name}` : file.name);
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
    }).pipe(retry({
      delay: 1000 * 5
    }));
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
      await setDoc(docRef, this.clone(value));
    }
    return value;
  }
  clone<T>(val: T) {
    return JSON.parse(
      JSON.stringify(val)
    ) as T
  }
  async update(modelName: ModelName, id: string, value: Models) {
    const docRef = doc(fbStore, modelName, id);
    if (value) {
      await updateDoc(docRef, { ...this.clone(value) });
    }
  }
  async patch(modelName: ModelName, id: string, prop: string, value: any) {
    const docRef = doc(fbStore, modelName, id);
    if (typeof value !== 'undefined') {
      const data = {
        [prop]: typeof value == 'object' ? this.clone(value) : value
      }
      await updateDoc(docRef, data);
      return true;
    }
    return false;
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
