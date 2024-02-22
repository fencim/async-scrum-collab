import { convoBus } from 'src/modules/ceremony/convo-bus';
import { ToEmit, ToType } from 'src/structs';

import { Auth } from './auth/definition';
import { Iteration } from './iteration/definition';
import { Project } from './project/definition';
import { Discussion } from './discussion/definition';
import { DeferredPromise } from 'src/resources/localbase';

export type WorkflowStructs = Auth | Iteration | Project | Discussion;

type WorkflowEvents = ToEmit<WorkflowStructs, WorkflowStructs>;
export type WorkflowTypes = ToType<WorkflowStructs, WorkflowStructs>;


const theBus = convoBus;
export const TheWorkflows = {
  on(desc: WorkflowEvents) {
    theBus.off(desc.type, desc.cb as VoidFunction);
    theBus.off(desc.type);
    theBus.on(desc.type, desc.cb as VoidFunction);
  },
  off(desc: WorkflowEvents) {
    theBus.off(desc.type);
  },
  emit(desc: WorkflowStructs) {
    theBus.emit(desc.type, desc.arg);
  },
  /**
   * Requires done and error Callbacks to defined
   * use done callback to resolve promise and error callback to reject
  */
  emitPromised<T = void>(desc: WorkflowStructs) {
    const deferred = new DeferredPromise<T>();
    const promised = {
      type: desc.type,
      arg: {
        ...desc.arg,
        done: deferred.resolve,
        error: deferred.reject
      }
    } as WorkflowStructs;
    this.emit(promised);
    return deferred.promise;
  }
};
