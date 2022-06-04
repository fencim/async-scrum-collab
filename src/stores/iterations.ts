import { defineStore } from 'pinia';
import { date } from 'quasar';
import { IIteration } from 'src/entities';
import { iterationService } from 'src/services';

export const useIterationStore = defineStore('iteration', {
  state: () => ({
    iterations: [] as IIteration[]
  }),

  getters: {

  },
  actions: {
    async ofProject(key: string) {
      this.iterations = await iterationService.findAllFrom({
        projectKey: key
      });
      return this.iterations.map(i => ({
        ...i,
        start: date.formatDate(i.start, 'MMM D, YYYY'),
        end: date.formatDate(i.end, 'MMM D, YYYY')
      })).sort((a, b) => {
        return date.getDateDiff(a.end, b.end, 'days')
      });
    },

    async withKey(project: string, key: string) {
      if (!this.iterations || !this.iterations.length) {
        return await iterationService.findOne({
          key,
          projectKey: project
        });
      }
      return this.iterations.find(i => i.projectKey == project && i.key == key);
    },
    async saveIteration(iteration: IIteration) {
      await iterationService.setData(iteration.key, iteration);
      const index = this.iterations.findIndex(i => i.key == iteration.key);
      if (index < 0) {
        this.iterations.push(iteration);
      } else {
        this.iterations.splice(index, 1, iteration);
      }
      return iteration;
    }
  }
});
