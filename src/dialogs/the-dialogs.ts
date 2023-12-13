import { convoBus } from 'src/modules/ceremony/convo-bus';
import { ToEmit, ToType } from 'src/structs';
import { Discussions } from './discussion/definition';
import { Iterations } from './iteration/definition';

export type DialogStructs =
  | Discussions
  | Iterations;

type DialogEvents = ToEmit<DialogStructs, DialogStructs>;
export type WorkflowTypes = ToType<DialogStructs, DialogStructs>;
const theBus = convoBus;
export const TheDialogs = {
  on(desc: DialogEvents) {
    theBus.off(desc.type, desc.cb as VoidFunction);
    theBus.off(desc.type);
    theBus.on(desc.type, desc.cb as VoidFunction);
  },
  off(desc: DialogEvents) {
    theBus.off(desc.type);
  },
  emit(desc: DialogStructs) {
    theBus.emit(desc.type, desc.arg);
  },
};
