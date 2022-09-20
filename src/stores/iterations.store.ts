import { defineStore } from 'pinia';
import { date } from 'quasar';
import { map } from 'rxjs';
import { IIteration } from 'src/entities';
import { iterationResource } from 'src/resources';
interface IIterationState {
  iterations: IIteration[];
  activeIteration?: IIteration;
}
export const useIterationStore = defineStore(
  'iteration', {
  state: () => ({
    iterations: []
  } as IIterationState),
  actions: {
    async ofProject(key: string) {
      iterationResource.stream({ projectKey: key })
        .pipe(map(stream => {
          return stream.map(i => ({
            ...i,
            start: date.formatDate(i.start, 'MMM D, YYYY'),
            end: date.formatDate(i.end, 'MMM D, YYYY')
          })).sort((a, b) => {
            return date.getDateDiff(a.end, b.end, 'days')
          });
        }))
        .subscribe({
          error: (e) => {
            console.log(e);
          },
          next: (stream) => {
            this.iterations = stream;
          }
        });
    },

    async selectIteration(project: string, key: string) {
      if (!this.iterations || !this.iterations.length) {
        this.activeIteration = this.iterations.find(i => i.projectKey == project && i.key == key)
          || await iterationResource.findOne({
            key,
            projectKey: project
          });
        return this.activeIteration;
      } else {
        this.activeIteration = undefined;
      }
    },
    async saveIteration(iteration: IIteration) {
      await iterationResource.setData(iteration.key, iteration);
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
