import { defineStore } from 'pinia';
import { IProfile } from 'src/entities';
import { convoResource, discussionResource, iterationResource, mediaResource, profileResource, projectResource } from 'src/resources';
import { firebaseService } from 'src/services/firebase.service';
import { logsResource } from 'src/resources/logs.resource';
import { sessionResource } from 'src/resources/session.resource';
import { synchronizerConnection } from 'src/workers/synchronizer/synchronizer.connection';
import { UserCredential } from 'firebase/auth';

const botProfile = { avatar: 'icons/bot2.png', key: 'bot', name: 'Auto Bot' };
interface IProfileState {
  profiles: IProfile[];
  theUser?: IProfile;
}

export const useProfilesStore = defineStore('Profiles', {
  state: () => ({
    profiles: [botProfile] as IProfile[],
    members: [],
    theUser: undefined as IProfile | undefined
  } as IProfileState),

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
      const cleanUp = async () => {
        this.theUser = undefined;
        await firebaseService.signout();
        await convoResource.deleteAll();
        await discussionResource.deleteAll();
        await iterationResource.deleteAll();
        await mediaResource.deleteAll();
        await projectResource.deleteAll();
        await profileResource.deleteAll();
        await sessionResource.deleteAll();
      }
      if (this.theUser) {
        return new Promise(async (resolve) => {
          const timeout = setTimeout(() => {
            cleanUp();
            resolve(undefined);
          }, 5000)
          await logsResource.setData('', {
            type: 'auth-logout',
            username: this.theUser!.email || this.theUser!.key,
          }, undefined, async (info) => {
            clearTimeout(timeout);
            if (info.status == 'synced') {
              await cleanUp();
              resolve(undefined);
            }
          })

        }).catch(() => cleanUp())

      }
    },
    getUser() {
      let user;
      let justLoggedIn = !this.theUser;
      this.theUser = this.theUser || (user = firebaseService.auth()) && {
        avatar: (user?.photoURL || ''),
        key: user?.uid || user?.email || '',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified,
        name: user?.displayName || user?.email || 'None'
      } || undefined;
      justLoggedIn = justLoggedIn && !!this.theUser;
      if (justLoggedIn && this.theUser && this.theUser.key) {
        profileResource.setData(this.theUser.key, this.theUser);
        synchronizerConnection.setUserKey(this.theUser.key);
      }
      if (this.theUser?.avatar && /^http/.test(this.theUser?.avatar)) {
        mediaResource.cacheHttpUrl(this.theUser.avatar)
          .then((cachedUrl) => {
            if (this.theUser && cachedUrl) {
              this.theUser.avatar = cachedUrl || this.theUser.avatar;
            }
          })
      }
      return this.theUser;
    },
    async init() {
      this.profiles = [botProfile, ...await profileResource.findAllFrom()];
    },
    async get(key: string) {
      return this.profiles.find(p => p.key == key)
        || await profileResource.findOne({ key })
        || await profileResource.getData(key);
    },
    fromKeys(keys: string[]) {
      return (keys.map(key => {
        return this.profiles.find(p => p.key == key);
      })).filter(p => p) as IProfile[];
    },
    async selectProjectMembers(members: string[]) {
      const profiles = (await Promise.all(members.map(async (m) => {
        const p = await this.get(m);
        if (p && p.avatar) {
          const cachedUrl = await mediaResource.cacheHttpUrl(p.avatar);
          if (typeof cachedUrl == 'string' && cachedUrl) {
            p.avatar = cachedUrl || p.avatar;
          }
        }
        return p;
      }))) as IProfile[];
      return profiles;
    },
    setAsTheUser(profileKey: string) {
      this.theUser = this.profiles.find(p => p.key == profileKey);
    },
    async signInWithGoogle() {
      this.theUser = undefined;
      const cred = await firebaseService.signInWithGoolgeAccount();
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      this.theUser && await profileResource.synchingData(this.theUser.key);
      if (this.theUser) {
        logsResource.setData('', {
          type: 'auth-login',
          username: this.theUser.email || this.theUser.key,
        })
      }
      return cred;
    },
    async signInAnonymously() {
      const cred = await firebaseService.signInAnonymously();
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      if (this.theUser) {
        logsResource.setData('', {
          type: 'auth-login',
          username: this.theUser.email || this.theUser.key,
        })
      }
      return cred;
    },
    async signIn(email: string, password: string) {
      const cred = await firebaseService.signInWithEmailandPass(email, password);
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      if (this.theUser) {
        return new Promise<UserCredential>((resolve) => {
          logsResource.setData('', {
            type: 'auth-login',
            username: this.theUser!.email || this.theUser!.key,
          }, true, () => {
            resolve(cred)
          })
        })
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
