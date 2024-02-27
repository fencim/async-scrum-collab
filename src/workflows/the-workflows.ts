import { convoBus } from 'src/modules/ceremony/convo-bus';
import { ToEmit, ToType } from 'src/structs';

import { Auth } from './auth/definition';
import { Iteration } from './iteration/definition';
import { Project } from './project/definition';
import { Discussion } from './discussion/definition';
import { DeferredPromise } from 'src/resources/localbase';
import { Logs } from './logs/definition';
import { useEmitStore } from 'src/stores/emit.store';
import { useActiveStore } from 'src/stores/active.store';

export type WorkflowStructs = Auth | Iteration | Project | Discussion | Logs;

type WorkflowEvents = ToEmit<WorkflowStructs, WorkflowStructs>;
export type WorkflowTypes = ToType<WorkflowStructs, WorkflowStructs>;


const theBus = convoBus;
export const TheWorkflows = {
  on(desc: WorkflowEvents) {
    theBus.off(desc.type, desc.cb as VoidFunction);
    theBus.off(desc.type);
    theBus.on(desc.type, desc.cb as VoidFunction);
    const emitStore = useEmitStore();
    if (desc.permissions) {
      emitStore.permissable({
        transactionType: desc.type,
        roles: desc.permissions || []
      })
    }
    emitStore.loggable({
      transactionType: desc.type,
      value: desc.loggable || 'console',
      info: {
        icon: desc.icon || 'poll',
        module: desc.module || 'shared'
      }
    })
  },
  off(desc: WorkflowEvents) {
    theBus.off(desc.type);
  },
  emit(desc: WorkflowStructs) {
    const activeStore = useActiveStore();
    const emitStore = useEmitStore();
    const role = activeStore.getUserRole();
    const permissions = emitStore.permissions[desc.type];
    if ((permissions?.length && !role)
      || (permissions?.length && !permissions.includes(role || 'anonymous'))) {
      //denied access
      console.error('Access denied on ' + desc.type);
      if (typeof (desc.arg as { error: ErrorCallback })?.error == 'function') {
        (desc.arg as { error: ErrorCallback }).error(new Error('Access denied on ' + desc.type))
      }
      return;
    }
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
