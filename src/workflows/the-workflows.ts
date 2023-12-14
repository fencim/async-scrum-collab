import { convoBus } from 'src/modules/ceremony/convo-bus';
import { ToEmit, ToType } from 'src/structs';

import { Auth } from './auth/definition';
import { Iteration } from './iteration/definition';
import { Project } from './project/definition';

export type WorkflowStructs = Auth | Iteration | Project;

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
};
