import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';

TheWorkflows.on({
  type: 'createDiscussion',
  async cb(e) {
    const { item, iterationKey, projectKey, refItem, done } = e;
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
    done && done(result)
  },
})
