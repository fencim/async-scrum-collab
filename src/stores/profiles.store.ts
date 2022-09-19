import { defineStore } from 'pinia';
import { IProfile } from 'src/entities';
import { convoResource, discussionResource, iterationResource, mediaResource, profileResource, projectResource } from 'src/resources';
import { firebaseService } from 'src/resources/firebase.service';
import { sessionResource } from 'src/resources/session.resource';
const botProfile = { avatar: 'icons/bot2.png', key: 'bot', name: 'Auto Bot' };
interface IProfileState {
  profiles: IProfile[];
  members: IProfile[];
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
      let justLoggedIn = !this.theUser;
      this.theUser = this.theUser || (user = firebaseService.auth()) && {
        avatar: (user?.photoURL || ''),
        key: user?.uid || user?.email || '',
        name: user?.displayName || user?.email || 'None'
      } || undefined;
      justLoggedIn = justLoggedIn && !!this.theUser;
      if (justLoggedIn && this.theUser && this.theUser.key) {
        profileResource.setData(this.theUser.key, this.theUser);
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
      return this.profiles.find(p => p.key == key) || profileResource.findOne({ key });
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
      const cred = await firebaseService.signInWithGoolgeAccount();
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
      return cred;
    },
    async signIn(email: string, password: string) {
      const cred = await firebaseService.signInWithEmailandPass(email, password);
      await sessionResource.setData('currentUser', cred.user.toJSON() as object);
      this.theUser = this.getUser();
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
