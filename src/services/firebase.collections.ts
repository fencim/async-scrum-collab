import { Firestore, collection } from 'firebase/firestore';

export function getCollections(fbStore: Firestore) {
  return {
    'profiles': () => collection(fbStore, 'profiles'),
    'projects': () => collection(fbStore, 'projects'),
    'iterations': () => collection(fbStore, 'iterations'),
    'ceremonies': () => collection(fbStore, 'ceremonies'),
    'discussions': () => collection(fbStore, 'discussions'),
    'convos': () => collection(fbStore, 'convos'),
    'medias': () => collection(fbStore, 'medias'),
    'online': () => collection(fbStore, 'online'),
    'logs': () => collection(fbStore, 'logs')
  };
}
