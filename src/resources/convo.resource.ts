import { Convo } from 'src/entities';
import { FbBaseResource } from './fb-base.resource';

class ConvoResource extends FbBaseResource<Convo> {
  constructor() {
    super('convos', 'key')
  }

}
export const convoResource = new ConvoResource();
