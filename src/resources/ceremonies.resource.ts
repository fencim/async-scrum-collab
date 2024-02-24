import { ICeremony } from 'src/entities';
import { FbBaseResource } from './fb-base.resource';
class CeremonyResource extends FbBaseResource<ICeremony> {
  constructor() {
    super('ceremonies')
  }
}
export const ceremonyResource = new CeremonyResource();
