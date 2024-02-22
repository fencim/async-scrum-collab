import { DiscussionItem } from 'src/entities';
import { firebaseService } from '../services/firebase.service';
import { Entity, Filters } from './localbase/state-db.controller';
import { Observable } from 'rxjs';
import { FbBaseResource } from './fb-base.resource';

class DiscussionResource extends FbBaseResource<DiscussionItem> {
  protected streamCb(filters?: Filters<Entity> | undefined): void | Observable<DiscussionItem[]> {
    return firebaseService
      .streamWith<DiscussionItem>('discussions', filters && this.arrayFilter(filters) || {});
  }
  constructor() {
    super('discussions')
  }
}
export const discussionResource = new DiscussionResource();
