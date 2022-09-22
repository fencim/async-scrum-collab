import { defineStore } from 'pinia';
import { date } from 'quasar';
import { map } from 'rxjs';
import { ICeremony } from 'src/entities';
import { ceremonyResource } from 'src/resources';

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
    setActiveCeremony(ceremony: ICeremony) {
      this.activeCeremony = ceremony;
    },
    async ofIteration(project: string, iterationKey?: string) {
      ceremonyResource.stream({
        projectKey: project,
        iterationKey
      }).pipe(map(stream => {
        return stream.sort((a, b) => {
          return date.getDateDiff(a.start, b.start, 'hours');
        })
      })).subscribe({
        next: ((stream) => {
          this.ceremonies = stream;
        })
      });
    },
    async withKey(project: string, iterationKey: string, key: string) {
      return this.ceremonies.find(c => c.projectKey == project &&
        c.iterationKey == iterationKey &&
        c.key == key) || await ceremonyResource.findOne({
          key,
          iterationKey,
          projectKey: project
        });
    },
    async saveCeremony(ceremony: ICeremony) {
      const save = {
        ...ceremony,
        discussions: [...ceremony.discussions].filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
      };
      await ceremonyResource.setData(ceremony.key, save);
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
