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
      iterationResource.streamWith({ projectKey: key })
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
          next: (stream) => {
            this.iterations = stream;
            // if (this.activeIteration) {
            //   this.selectIteration(key, this.activeIteration.key);
            // }
          }
        });
    },
    async getIteration(key: string) {
      return this.iterations.find(i => i.key == key)
        || await iterationResource.findOne({ key });
    },
    async selectIteration(project: string, key: string) {
      if (project && key) {
        this.activeIteration = this.iterations.find(i => i.projectKey == project && i.key == key)
          || await iterationResource.findOne({
            key,
            projectKey: project
          });
      } else {
        this.activeIteration = undefined;
      }
      return this.activeIteration;

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
