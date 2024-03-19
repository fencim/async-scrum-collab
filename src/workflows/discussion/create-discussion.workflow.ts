import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { useProfilesStore } from 'src/stores/profiles.store';

TheWorkflows.on({
  type: 'createDiscussion',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const { item, iterationKey, projectKey, refItem, done, error } = e;
    const discussionStore = useDiscussionStore();
    const discussions = discussionStore.discussions;
    let counter = discussions.length;
    let key: string;
    do {
      key = projectKey + item.type + counter;
      counter++;
    } while (discussions.find((d) => d.key == key));
    item.key = key;
    item.iteration = item.iteration || iterationKey;
    item.projectKey = projectKey;
    if (refItem) {
      item.parent = entityKey(refItem);
    }
    const result = await discussionStore.saveDiscussion(item);
    const theUser = useProfilesStore().theUser;
    if (result?.type == 'scrum' && theUser) {
      TheWorkflows.emit({
        type: 'assignTask',
        arg: {
          item: result,
          profile: theUser,
          done,
          error
        }
      })
    } else {
      done && done(result);
      TheWorkflows.emit({
        type: 'assessDiscussion',
        arg: {
          item: result,
          error
        }
      })
    }
  },
})
