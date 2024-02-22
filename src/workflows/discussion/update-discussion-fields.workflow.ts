import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';

TheWorkflows.on({
  type: 'updateDiscussionFields',
  async cb(e) {
    const discussionStore = useDiscussionStore();
    const old = await discussionStore.getUpdated(e.payload.key);
    if (!old) return;
    type RecordType = typeof old;
    type FieldType = keyof RecordType;
    const editables: FieldType[] = Object.keys(e.payload) as FieldType[];
    const props = editables.filter((field) => {
      if (/^(id|key)$/i.test(field) || field.startsWith('*')) return false;
      if (Array.isArray(old[field]) && Array.isArray(e.payload[field])) {
        return (old[field] as string[]).map(a => entityKey(a)).sort().join(',') !==
          (e.payload[field] as string[]).map(a => entityKey(a)).sort().join(',')
      } else if (typeof e.payload[field] == 'object' || typeof old[field] == 'object') {
        return entityKey(old[field] as string) !== entityKey(e.payload[field] as string);
      }
      return old[field] !== e.payload[field];
    });
    const update = await discussionStore.updateDiscussion(old.key, props, e.payload);
    if (update && e.done) {
      e.done(update);
    } else if (e.error && !update) {
      e.error(new Error('Failed to update'));
    }
  },
})
