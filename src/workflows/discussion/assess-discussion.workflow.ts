import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheWorkflows } from '../the-workflows';
import { useConvoStore } from 'src/stores/convo.store';
import { useActiveStore } from 'src/stores/active.store';
import { entityKey } from 'src/entities/base.entity';
import { format } from 'quasar';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useCeremonyStore } from 'src/stores/ceremonies.store';

TheWorkflows.on({
  type: 'assessDiscussion',
  permissions: ['admin', 'moderator', 'member'],
  async cb(e) {
    const discussionStore = useDiscussionStore();
    const ceremonyStore = useCeremonyStore();
    const convoStore = useConvoStore();
    const activeStore = useActiveStore();
    const project = activeStore.activeProject;
    const discussion = e.item;
    if (discussion.iteration && project) {
      try {
        const convo = await convoStore.ofDiscussion(entityKey(discussion.iteration), discussion.key);
        if (discussion.convoCount && convo.length < discussion.convoCount) {
          e.done && e.done();
          return;
        }
        const report = discussionStore.checkCompleteness(
          discussion,
          project.members,
          convo
        );
        if (discussion.progress != report[0].progress) {
          const oldProgress = discussion.progress;
          discussion.progress = report[0].progress;
          await discussionStore.updateDiscussion(discussion.key, ['progress'], discussion);
          const ceremony = ceremonyStore.ceremonies.find(c =>
            (c.key == discussion.ceremonyKey) ||
            (!discussion.ceremonyKey && c.type == 'planning' && discussion.iteration && c.iterationKey == entityKey(discussion.iteration)));
          if (ceremony) {
            await TheWorkflows.emitPromised({
              type: 'assessCeremony',
              arg: { ceremony }
            })
          }
          convoStore.sendMessage(
            discussion.projectKey,
            entityKey(discussion.iteration),
            discussion.key,
            'bot',
            {
              type: 'message',
              message: `${format.capitalize(
                discussion.type
              )} progressed from ${(
                (oldProgress || 0) * 100
              ).toFixed(2)}% to ${(100 * (report[0].progress || 0)).toFixed(
                2
              )}% by ${useProfilesStore().theUser?.name || 'a user'}`,
            }
          );
        }
        e.done && e.done(report);
      } catch (error) {
        e.error && e.error(new Error(String(error)));
      }
    } else if (e.error) {
      e.error(new Error('Discussion is not part of an iteration'));
    }
  },
})
