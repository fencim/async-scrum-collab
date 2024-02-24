import { defineStore } from 'pinia';
import { date } from 'quasar';
import { map } from 'rxjs';
import { DiscussionItem, ICeremony } from 'src/entities';
import { ceremonyResource } from 'src/resources';
import { useDiscussionStore } from './discussions.store';
import { DeferredPromise } from 'src/resources/localbase';

export const useCeremonyStore = defineStore('ceremony', {
  state: () => ({
    ceremonies: [] as ICeremony[],
    activeDiscussions: [] as DiscussionItem[],
    activeCeremony: undefined as ICeremony | undefined
  }),
  getters: {
    activeCeremonyProgress(): number {
      return this.activeCeremony?.progress || 0;
    },
  },
  actions: {
    async setActiveCeremony(ceremony?: ICeremony) {
      this.activeCeremony = ceremony;
      if (ceremony) {
        const discussionStore = useDiscussionStore();
        const result = await Promise.all(ceremony.discussions
          .map(key => discussionStore.withKey(key)));
        this.activeDiscussions = result.filter(d => d) as DiscussionItem[];
      } else {
        this.activeDiscussions = [];
      }
    },
    async ofProject(project: string) {
      ceremonyResource.streamWith({
        projectKey: project
      }).pipe(map(stream => {
        return stream.sort((a, b) => {
          return date.getDateDiff(a.start, b.start, 'hours');
        })
      })).subscribe({
        next: ((stream) => {
          this.ceremonies = stream;
          if (this.activeCeremony) {
            this.setActiveCeremony(stream.find(c => c.key == this.activeCeremony?.key));
          }
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
    },
    async patchCeremony<T extends keyof ICeremony>(
      key: string,
      props: T[],
      source: Partial<ICeremony>
    ) {
      const deferred = new DeferredPromise<ICeremony | undefined>();
      ceremonyResource.updatePropertiesFrom(key, source, props, async (update) => {
        if (update.status == 'synced') {
          deferred.resolve(await ceremonyResource.getLocalData(update.newKey || update.key || ''));
        } else if (/error/i.test(update.status)) {
          const doc = await ceremonyResource.getDoc(update.newKey || update.key || '');
          deferred.reject(doc?.remarks || 'Failed to update Ceremony');
        }
      });
      const result = await deferred.promise;
      if (result) {
        const existing = this.ceremonies.find(c => c.key == result.key);
        if (existing) {
          existing.progress = result.progress;
        }
      }
      return result;
    },
  }
});
