import { defineStore } from 'pinia';
import { IProfile } from 'src/entities';
import { convoResource, discussionResource, iterationResource, mediaResource, profileResource, projectResource } from 'src/resources';
import { firebaseService } from 'src/resources/firebase.service';
import { sessionResource } from 'src/resources/session.resource';
const botProfile = { avatar: 'icons/bot2.png', key: 'bot', name: 'Auto Bot' };

export const useProfilesStore = defineStore('Profiles', {
  state: () => ({
    profiles: [botProfile] as IProfile[],
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
    async signout() {
      await firebaseService.signout();
      await convoResource.deleteAll();
      await discussionResource.deleteAll();
      await iterationResource.deleteAll();
      await mediaResource.deleteAll();
      await projectResource.deleteAll();
      await profileResource.deleteAll();
      await sessionResource.deleteAll();
    },
    getUser() {
      let user;
      this.theUser = this.theUser || (user = firebaseService.auth()) && {
        avatar: user?.photoURL || '',
        key: user?.email || '',
        name: user?.displayName || user?.email || 'None'
      } || undefined;
      if (this.theUser && this.theUser.key) {
        profileResource.setData(this.theUser.key, this.theUser);
      }
      return this.theUser;
    },
    async init() {
      this.profiles = [botProfile, ...await profileResource.findAllFrom()];
    },
    async get(key: string) {
      return this.profiles.find(p => p.key == key) || profileResource.findOne({ key });
    },
    async fromKeyList(members: string[]) {
      return (await Promise.all(members.map(m => (this.get(m))))) as IProfile[];
    },
    setAsTheUser(profileKey: string) {
      this.theUser = this.profiles.find(p => p.key == profileKey);
    },
    async signInWithGoogle() {
      const cred = await firebaseService.signInWithGoolgeAccount();
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      if (this.theUser) {
        await profileResource.setData(this.theUser?.key, this.theUser)
      }
      return cred;
    },
    async signIn(email: string, password: string) {
      const cred = await firebaseService.signInWithEmailandPass(email, password);
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      if (this.theUser) {
        await profileResource.setData(this.theUser?.key, this.theUser)
      }
      return cred;
    },
    async register(profile: { email: string, password: string, displayName: string, photo?: File }) {
      const { email, password, displayName, photo } = profile;
      const user = await firebaseService.createUserWithEmailPass(email, password);
      const photoURL = await (new Promise<string | undefined>((resolve) => {
        if (photo) {
          resolve(firebaseService.uploadImage(photo, {
            path: email
          }))
        } else {
          resolve(undefined);
        }
      }))
      await firebaseService.updateProfile(displayName, photoURL);
      this.theUser = this.getUser();
      if (this.theUser) {
        profileResource.setData(this.theUser?.key, this.theUser)
      }
      return user;
    },
  }
});