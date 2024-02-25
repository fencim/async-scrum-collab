import { IIteration } from 'src/entities';
import { FbBaseResource } from './fb-base.resource';

class IterationResource extends FbBaseResource<IIteration> {
  constructor() {
    super('iterations')
  }
}
export const iterationResource = new IterationResource();
