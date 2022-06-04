import { defineStore } from 'pinia';
import { IProfile, profileService } from 'src/services';

export const useProfilesStore = defineStore('Profiles', {
  state: () => ({
    profiles: [] as IProfile[],
    theUser: undefined as IProfile | undefined
  }),

  getters: {
    presentUser(): IProfile | undefined {
      return this.theUser || this.profiles.find(p => p.key == 'AR1');
    }
  },

  actions: {
    async init() {
      profileService.saveAllTo([
        {
          key: 'bot',
          name: 'Auto Bot',
          avatar: 'icons/bot2.png',
        },
        {
          key: 'RL1',
          name: 'Ruby Larson',
          avatar: 'icons/avatar1.jpg',
        },
        {
          key: 'IN1',
          name: 'Ida Nitzsche',
          avatar: 'icons/avatar2.jpg',
        },
        {
          key: 'AK1',
          name: 'Alfredo Kub',
          avatar: 'icons/avatar3.jpg',
        },
        {
          key: 'AR1',
          name: 'Anissa Roob',
          avatar: 'icons/avatar4.jpg',
        },
        {
          key: 'EM1',
          name: 'Erica Murphy',
          avatar: 'icons/avatar5.jpg',
        },
        {
          key: 'JK1',
          name: 'Jermey Kuhn',
          avatar: 'icons/avatar1.jpg',
        },
        {
          key: 'BK1',
          name: 'Belle Kub',
          avatar: 'icons/avatar2.jpg',
        },
        {
          key: 'LK1',
          name: 'Leanne Kunze',
          avatar: 'icons/avatar3.jpg',
        },
        {
          key: 'OG1',
          name: 'Oda Graham',
          avatar: 'icons/avatar4.jpg',
        },
        {
          key: 'RF1',
          name: 'Rebeka Frami',
          avatar: 'icons/avatar5.jpg',
        },
        {
          key: 'HC1',
          name: 'Hope Conn',
          avatar: 'icons/avatar1.jpg',
        },
        {
          key: 'MW1',
          name: 'Michel Wiza',
          avatar: 'icons/avatar2.jpg',
        },
      ]);
      this.theUser = this.presentUser;
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
    }
  }
});
