import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from '../the-workflows';
import { entityKey } from 'src/entities/base.entity';
import { IVote } from 'src/entities';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useActiveStore } from 'src/stores/active.store';
import { date } from 'quasar';

TheWorkflows.on({
  type: 'voteForComplexity',
  permissions: ['admin', 'moderator', 'member'],
  loggable: 'operation',
  async cb(e) {
    const { item, vote, voter, done, error } = e;
    const convoStore = useConvoStore();
    const discussionStore = useDiscussionStore();
    const activeStore = useActiveStore();

    if (activeStore.canUserModerate && !item.complexity) {
      item.complexity = Number(vote);
      item.datePlanned = date.formatDate(new Date(), 'YYYY/MM/DD');
      await discussionStore.updateDiscussion(item.key, ['complexity', 'datePlanned'], item);
      if (item.iteration) {
        await TheWorkflows.emitPromised({
          type: 'sendMessage',
          arg: {
            discussion: item.key,
            iteration: entityKey(item.iteration),
            message: 'As moderator, I\'m overriding voting for this ticket to ' + vote
          }
        })
      }
      done && done(item);
      return;
    }
    if (item && item.iteration) {
      await convoStore.sendMessage(
        item.projectKey,
        entityKey(item.iteration),
        item.key,
        voter,
        {
          type: 'vote',
          vote: vote,
          ref: 'ticket:' + item.key,
          message: 'I voted for this ticket',
        }
      );
    } else {
      //not part of iteration
      done && done(item);
      return;
    }
    //delay
    await new Promise(resolve => setTimeout(resolve, 100));
    const convo = await convoStore.ofDiscussion(entityKey(item.iteration), item.key)
    TheWorkflows.emit({
      type: 'assessDiscussion',
      arg: {
        item,
        async done(report) {
          if (!report) return;
          const voteReport = report && report.find((r) => r.factor == 'votes');
          if (voteReport && voteReport.progress >= 1) {
            const voteCasts = convo.filter(
              (v) => v.type == 'vote'
            ) as IVote[];

            const votes = voteCasts
              .reduce(
                (p, c) => (typeof c.vote == 'undefined' ? [] : p.concat([c])),
                [] as IVote[]
              )
              .map((v) => v.vote)
              .sort()
              .reverse();
            const uniqueVotes = [...new Set(votes)];
            const voteCounts = uniqueVotes.reduce(
              (p, c) => p.concat([votes.filter((v) => v == c).length]),
              [] as number[]
            );
            const majorityVoteIndex = voteCounts.reduce(
              (p, c, index, self) =>
                c > 1 && (p < 0 || self[p] < c) ? index : self[p] == c ? -1 : p,
              -1
            );
            if (majorityVoteIndex >= 0 && item.iteration) {
              const winningVote = uniqueVotes[majorityVoteIndex];
              await convoStore.sendMessage(
                item.projectKey,
                entityKey(item.iteration),
                item.key,
                'bot',
                {
                  type: 'message',
                  message:
                    'All votes are collected (' +
                    uniqueVotes.map((v, i) => v + ':' + voteCounts[i]).join(', ') +
                    ') with majority of ' +
                    winningVote,
                }
              );
              item.complexity = Number(winningVote);
              await discussionStore.updateDiscussion(item.key, ['complexity'], item);
            } else if (uniqueVotes.length > 0 && item.iteration) {
              const winningVote =
                uniqueVotes[Math.max(0, Math.round(uniqueVotes.length / 2) - 1)];
              await convoStore.sendMessage(
                item.projectKey,
                entityKey(item.iteration),
                item.key,
                'bot',
                {
                  type: 'message',
                  message:
                    'All votes are collected (' +
                    uniqueVotes.map((v, i) => v + ':' + voteCounts[i]).join(', ') +
                    ') with median of ' +
                    winningVote,
                }
              );
              item.complexity = Number(winningVote);
              item.datePlanned = date.formatDate(new Date(), 'YYYY/MM/DD');
              await discussionStore.updateDiscussion(item.key, ['complexity', 'datePlanned'], item);
            }
          }
          done && done(item);
        },
        error
      }
    });

  },
})
