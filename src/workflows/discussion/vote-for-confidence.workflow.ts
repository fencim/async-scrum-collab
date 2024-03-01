import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { IVote } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';

TheWorkflows.on({
  type: 'voteForConfidence',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const { ceremony, vote, voter, done, error } = e;
    const convoStore = useConvoStore();
    const discussionStore = useDiscussionStore();
    const ceremonyStore = useCeremonyStore();
    const activeStore = useActiveStore();
    const convo = await convoStore.ofDiscussion((ceremony.iterationKey), ceremony.key)
    const members = activeStore.activeMembers.map(m => m.key);
    const voteCasts = convo.filter(c =>
      (c.type == 'vote')
      && members.includes(entityKey(c.from || ''))).sort((a, b) => a.date.localeCompare(b.date)) as IVote[];
    const lastIndex = voteCasts.findLastIndex((v) => v.vote == '0');
    if (lastIndex >= 0) {
      voteCasts.splice(0, lastIndex + 1);
    }
    if (activeStore.canUserModerate && ceremony.type == 'planning' && !ceremony.confidence && voteCasts.length == 0) {
      ceremony.confidence = Number(vote);
      ceremony.totalCommitted = discussionStore.fromIteration(ceremony.projectKey, ceremony.iterationKey)
        .reduce((total, r) => total + Number(r.complexity || 0), 0)
      await ceremonyStore.patchCeremony(ceremony.key, ['confidence', 'totalCommitted'], ceremony);
      if (ceremony.iterationKey) {
        await TheWorkflows.emitPromised({
          type: 'sendMessage',
          arg: {
            discussion: ceremony.key,
            iteration: ceremony.iterationKey,
            message: 'As moderator, I\'m overriding voting for this confidence vote to ' + vote
          }
        })
      }
      done && done(ceremony);
      return;
    }
    if (ceremony && ceremony.iterationKey) {
      await convoStore.sendMessage(
        ceremony.projectKey,
        ceremony.iterationKey,
        ceremony.key,
        voter,
        {
          type: 'vote',
          vote: vote,
          ref: 'ceremony:' + ceremony.key,
          message: `I voted for this ${ceremony.type} ceremony`,
        }
      );
    } else {
      //not part of iteration
      error && error(new Error('Invalid Ceremony'));
      return;
    }
    //delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (voteCasts.length >= members.length && ceremony.iterationKey && ceremony.type == 'planning') {
      const winningVote = voteCasts.reduce((prev, curr) => prev + Number(curr.vote), 0) / voteCasts.length;
      await convoStore.sendMessage(
        ceremony.projectKey,
        ceremony.iterationKey,
        ceremony.key,
        'bot',
        {
          type: 'message',
          message:
            'All votes are collected with mean of ' + (Math.round(winningVote * 100) / 100),
        }
      );
      ceremony.confidence = Number(winningVote);
      ceremony.totalCommitted = discussionStore.fromIteration(ceremony.projectKey, ceremony.iterationKey)
        .reduce((total, r) => total + Number(r.complexity || 0), 0)
      await ceremonyStore.patchCeremony(ceremony.key, ['confidence', 'totalCommitted'], ceremony);
    }
    done && done(ceremony);
  },
})
