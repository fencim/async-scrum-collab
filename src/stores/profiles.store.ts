import { defineStore } from 'pinia';
import { IProfile } from 'src/entities';
import { profileService } from 'src/services';
import { firebaseService } from 'src/services/firebase.service';
import { sessionService } from 'src/services/session.services';


export const useProfilesStore = defineStore('Profiles', {
  state: () => ({
    profiles: [] as IProfile[],
    theUser: undefined as IProfile | undefined
  }),

  getters: {
    presentUser(): IProfile | undefined {
      return this.theUser;
    }
  },

  actions: {
    async authenticate() {
      if (!this.getUser()) {
        await firebaseService.autheticate();
        this.getUser();
      }
    },
    signout() {
      return firebaseService.signout();
    },
    getUser() {
      const user = firebaseService.auth();
      this.theUser = user && {
        avatar: user?.photoURL || '',
        key: user?.email || '',
        name: user?.displayName || user?.email || 'None'
      } || undefined;

      return this.theUser;
    },
    async init() {
      this.profiles = await profileService.findAllFrom();
    },
    async get(key: string) {
      return this.profiles.find(p => p.key == key) || profileService.findOne({ key });
    },
    async fromKeyList(members: string[]) {
      return (await Promise.all(members.map(m => (this.get(m))))) as IProfile[];
    },
    setAsTheUser(profileKey: string) {
      this.theUser = this.profiles.find(p => p.key == profileKey);
    },
    async signIn(email: string, password: string) {
      const cred = await firebaseService.signInWithEmailandPass(email, password);
      await sessionService.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      if (this.theUser) {
        profileService.setData(this.theUser?.key, this.theUser)
      }
      return cred;
    },
    async register(profile: { email: string, password: string, displayName: string, photo?: File }) {
      const { email, password, displayName, photo } = profile;
      const user = await firebaseService.createUserWithEmailPass(email, password);
      const photoURL = await (new Promise<string | undefined>((resolve, reject) => {
        const reader = new FileReader();
        const save = async () => {
          const photoURL = reader.result as string || undefined;
          resolve(photoURL);
        };
        reader.addEventListener('load', save)
        reader.addEventListener('error', reject);
        if (photo) {
          reader.readAsDataURL(photo);
        } else {
          save();
        }
      }))
      await firebaseService.updateProfile(displayName, photoURL);
      this.theUser = this.getUser();
      if (this.theUser) {
        profileService.setData(this.theUser?.key, this.theUser)
      }
      return user;
    },
  }
});
