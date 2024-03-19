import { defineStore } from 'pinia';
import { IProfile, ILoggable } from 'src/entities';
import { convoResource, discussionResource, iterationResource, mediaResource, profileResource, projectResource } from 'src/resources';
import { AccessStatus, firebaseService } from 'src/services/firebase.service';
import { sessionResource } from 'src/resources/session.resource';
import { synchronizerConnection } from 'src/workers/synchronizer/synchronizer.connection';

const botProfile = { avatar: '/icons/bot2.png', key: 'bot', name: 'Auto Bot' };
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
        await firebaseService.authenticate();
        this.getUser();
      } else if (!(firebaseService.accessStatus & AccessStatus.authorized)) {
        firebaseService.setAccessStatus(AccessStatus.authorized);
      }
    },
    async signOut() {
      const cleanUp = async () => {
        this.theUser = undefined;
        await firebaseService.signOut();
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
          setTimeout(() => {
            cleanUp();
            resolve(undefined);
          }, 5000)
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
    async getUserAsync() {
      if (this.theUser) return this.theUser;
      await firebaseService.validateAuth();
      const user = firebaseService.auth();
      const userLogged =
        (user && {
          key: user?.uid || user?.email || '',
          avatar: user?.photoURL || '',
          email: user?.email || 'none',
          emailVerified: user?.emailVerified,
          name: user?.displayName || user?.email || 'none',
        }) ||
        undefined;
      if (userLogged?.key) {
        const old = await profileResource.getData(userLogged.key);
        if (old) {
          this.theUser =
            (await profileResource.setData(userLogged.key, {
              ...old,
              ...userLogged,
              avatar: old.avatar
            })) || this.theUser;
        } else if (userLogged) {
          this.theUser =
            (await profileResource.setData(userLogged.key, {
              ...userLogged,
            })) || this.theUser;
        }
      }
      if (this.theUser?.avatar && this.theUser.avatar.length > 1 && /^http/.test(this.theUser.avatar)) {
        this.theUser.avatar = await mediaResource.cacheHttpUrl(this.theUser.avatar) || this.theUser.avatar;
      }
      return this.theUser;
    },
    clearUser() {
      this.theUser = undefined;
    },
    async init() {
      const all = (await profileResource.findAll()).contents;
      this.profiles = [botProfile, ...(all || [])];
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
      this.theUser = this.profiles.find(p => p.key == profileKey) || this.theUser;
    },
    async signInWithGoogle() {
      this.theUser = undefined;
      return await firebaseService.signInWithGoogleAccount();
    },
    async signInAnonymously() {
      const cred = await firebaseService.signInAnonymously();
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      return cred;
    },
    async signIn(email: string, password: string) {
      const cred = await firebaseService.signInWithEmailAndPass(email, password);
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      if (this.theUser) {
        return cred;
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
    async setLastReadNotification(log: ILoggable) {
      await sessionResource.setData('lastRead', log);
    }
  }
});
