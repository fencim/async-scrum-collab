import { defineStore } from 'pinia';
import { synchronizerConnection } from 'src/workers/synchronizer/synchronizer.connection';
export interface IResourceStatus {
  module: string,
  entity: string,
  total: number;
  synched: number;
  saved?: number;
  updated?: number;
  patched?: number;
  deleted?: number;
  error: number;
  createError?: number;
  updatedError?: number;
  patchedError?: number;
  deletedError?: number;
}

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
  }
});
