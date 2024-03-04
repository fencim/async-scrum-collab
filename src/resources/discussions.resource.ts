import { DiscussionItem } from 'src/entities';
import { FbBaseResource } from './fb-base.resource';

class DiscussionResource extends FbBaseResource<DiscussionItem> {
  constructor() {
    super('discussions')
  }
}
export const discussionResource = new DiscussionResource();
