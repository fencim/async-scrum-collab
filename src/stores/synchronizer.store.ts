import { defineStore } from 'pinia';
import { IResourceStatus, synchronizerConnection } from 'src/workers/synchronizer/synchronizer.connection';


interface ISynchronizerState {
  resources: IResourceStatus[];
}
export interface ISyncByModule {
  module: string;
  resources: IResourceStatus[];
}
export const useSynchronizerStore = defineStore('synchronizerStore', {
  state: () => ({
    resources: []
  } as ISynchronizerState),
  getters: {
    synchingTotal(): number {
      return this.resources.reduce(
        (prev, curr) =>
          prev +
          (curr.saved || 0) +
          (curr.updated || 0) +
          (curr.patched || 0) +
          (curr.deleted || 0),
        0
      );
    },
    synchingTotalError(): number {
      return this.resources.reduce(
        (prev, curr) =>
          prev +
          (curr.createError || 0) +
          (curr.updatedError || 0) +
          (curr.patchedError || 0) +
          (curr.deletedError || 0),
        0
      );
    },
    byModule(): ISyncByModule[] {
      const byModule: { module: string; resources: IResourceStatus[] }[] = [];
      return this.resources.reduce((prev, curr) => {
        if (curr.total == 0) return prev;
        const index = prev.findIndex((m) => m.module == curr.module);
        if (index >= 0 && !(prev[index].resources
          .find(r => r.module == curr.module && r.entity == curr.entity))) {
          prev[index].resources.push(curr);
        } else if (index < 0) {
          prev.push({
            module: curr.module,
            resources: [curr],
          });
        }
        return prev;
      }, byModule);
    },
  },
  actions: {
    retrySynching(payload?: { module?: string, entity?: string }) {
      synchronizerConnection.retrySynching(payload);
    },
    setStatusOf(update: IResourceStatus) {
      const index = this.resources.findIndex((r) => (r.module == update.module && r.entity == update.entity));
      if (index >= 0) {
        this.resources[0] = update;
      } else {
        this.resources.push(update);
      }
    },
  }
});
synchronizerConnection.updateCb = (update) => {
  const instance = useSynchronizerStore();
  instance.setStatusOf(update);
}
