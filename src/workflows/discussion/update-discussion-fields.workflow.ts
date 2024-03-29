import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';

TheWorkflows.on({
  type: 'updateDiscussionFields',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const discussionStore = useDiscussionStore();
    const old = await discussionStore.getUpdated(e.item.key);
    if (!old) return;
    type RecordType = typeof old;
    type FieldType = keyof RecordType;
    const editables: FieldType[] = Object.keys(e.item) as FieldType[];
    const props = editables.filter((field) => {
      if (/^(id|key)$/i.test(field) || field.startsWith('*')) return false;
      if (Array.isArray(old[field]) && Array.isArray(e.item[field])) {
        return (old[field] as string[]).map(a => entityKey(a) || JSON.stringify(a)).sort().join(',') !==
          (e.item[field] as string[]).map(a => entityKey(a) || JSON.stringify(a)).sort().join(',')
      } else if ((typeof e.item[field] == 'object' && e.item[field]) || typeof old[field] == 'object') {
        if ((e.item[field] as ({ key: string } | undefined))?.key || (old[field] as ({ key: string } | undefined))?.key)
          return entityKey(old[field] as string) !== entityKey(e.item[field] as string);
        else if (typeof e.item[field] === typeof old[field]) {
          const a = e.item[field] as unknown as Record<string, string>;
          const b = old[field] as unknown as Record<string, string>;
          return !Object.keys(a).reduce((p, c) => {
            return p && (a[c] == b[c])
          }, true);
        }
      }
      return old[field] !== e.item[field];
    });
    const update = await discussionStore.updateDiscussion(old.key, props, e.item);
    if (update) {
      await TheWorkflows.emitPromised({
        type: 'assessDiscussion',
        arg: { item: update }
      })
    }
    if (update && e.done) {
      e.done(update);
    } else if (e.error && !update) {
      e.error(new Error('Failed to update'));
    }
  },
})
