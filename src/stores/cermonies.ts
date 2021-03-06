import { defineStore } from 'pinia';
import { ICeremony } from 'src/entities';
import { ceremonyService } from 'src/services';

export const useCeremonyStore = defineStore('ceremony', {
  state: () => ({
    ceremonies: [] as ICeremony[],
    activeCeremony: undefined as ICeremony | undefined
  }),
  getters: {
    activeCeremonyProgress(): number {
      return this.activeCeremony?.progress || 0;
    }
  },
  actions: {
    async init() {
      this.ceremonies = await ceremonyService.findAllFrom();
    },
    setActiveCeremony(ceremony: ICeremony) {
      this.activeCeremony = ceremony;
    },
    async ofIteration(project: string, iterationKey: string) {
      if (!this.ceremonies || !this.ceremonies.length) {
        return await ceremonyService.findAllFrom({
          projectKey: project,
          iterationKey
        });
      }
      return this.ceremonies.filter(c => c.projectKey == project && c.iterationKey == iterationKey);
    },
    async withKey(project: string, iterationKey: string, key: string) {
      if (!this.ceremonies || !this.ceremonies.length) {
        return await ceremonyService.findOne({
          key,
          iterationKey,
          projectKey: project
        });
      }
      return this.ceremonies.find(c => c.projectKey == project &&
        c.iterationKey == iterationKey &&
        c.key == key);
    },
    async saveCeremony(ceremony: ICeremony) {
      const save = {
        ...ceremony,
        discussions: [...ceremony.discussions].filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
      };
      await ceremonyService.setData(ceremony.key, save);
      const index = this.ceremonies.findIndex(i => i.key == ceremony.key);
      if (index < 0) {
        this.ceremonies.push(save);
      } else {
        this.ceremonies.splice(index, 1, save);
      }
      return save;
    }
  }
});
