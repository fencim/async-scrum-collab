import { defineStore } from 'pinia';
import { date } from 'quasar';
import { map } from 'rxjs';
import { DiscussionItem, DiscussionReport, ICeremony, ConvoList, IQuestion, IVote } from 'src/entities';
import { ceremonyResource } from 'src/resources';
import { useDiscussionStore } from './discussions.store';
import { DeferredPromise } from 'src/resources/localbase';
import { entityKey } from 'src/entities/base.entity';

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
    async patchCeremony<K extends ICeremony, T extends keyof K>(
      key: string,
      props: T[],
      source: Partial<K>
    ) {
      const deferred = new DeferredPromise<ICeremony | undefined>();
      ceremonyResource.updatePropertiesFrom(key, source, props as (keyof ICeremony)[], async (update) => {
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
    checkCompleteness(ceremony: ICeremony, members: string[], convo: ConvoList) {
      const factors: DiscussionReport[] = [];
      const questions = convo.filter(c => c.type == 'question') as IQuestion[];
      const votes = convo.filter(c =>
        (c.type == 'vote')
        && members.includes(entityKey(c.from || '')))
        .sort((a, b) => a.date.localeCompare(b.date)) as IVote[];
      const lastIndex = votes.findLastIndex((v) => v.vote == '0');
      if (lastIndex >= 0) {
        votes.splice(0, lastIndex + 1);
      }

      const vCast = votes.reduce((p, c) =>
      (typeof c.vote == 'undefined' ? {} :
        { ...p, [entityKey(c.from)]: c.vote }),
        {} as { [v: string]: string });


      if (ceremony.type == 'planning') {
        factors.push(this.logFactor(Object.values(vCast).length, members.length, 'votes'));
      }
      const qProgress = questions.map((q) => {
        const totals = convo.reduce((p, c) => {
          if ((c.type == 'response' && c.ref == q.key)) {
            const casts = Object.values(c.feedback || {});
            return {
              agree: p.agree + casts.filter(v => (v == 'agree')).length,
              disagree: p.disagree + casts.filter(v => (v == 'disagree')).length
            };
          } else {
            return p;
          }
        }, { agree: 0, disagree: 0 })
        return {
          ...q,
          resolved: totals.agree > totals.disagree
        } as IQuestion
      }).reduce((p, q) => (
        q.resolved ?
          { ...p, resolved: p.resolved + 1 } :
          { ...p, pending: p.pending + 1 }),
        { resolved: 0, pending: 0 });

      factors.push(this.logFactor(qProgress.resolved, qProgress.resolved + qProgress.pending, 'questions resolution'));
      factors.splice(0, 0, this.logFactor(
        factors.reduce((p, c) => (p + c.progress), 0),
        factors.length, 'overall progress factors'))
      return factors;
    },
    logFactor(progress: number, over: number, msg: string) {
      const value = progress / Math.max(over, 1);
      if (value < 1 && (over > 0)) {
        return {
          progress: value,
          factor: msg,
          feedback: `Only ${Math.round(progress * 100) / 100} of ${over} of ${msg} is complete`
        };
      } else {
        return {
          factor: msg,
          progress: 1, feedback: msg[0].toUpperCase() + msg.substring(1) + ' is complete'
        };
      }
    },
  },

});
