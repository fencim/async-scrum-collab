<script lang="ts" setup>
import { QSpinnerDots, useQuasar } from 'quasar';
import { useProfilesStore } from 'src/stores/profiles.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { ref, computed } from 'vue';
import { TheDialogs } from '../the-dialogs';
import { ICeremony, IProfile, IVote } from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import { useConvoStore } from 'src/stores/convo.store';
import { entityKey } from 'src/entities/base.entity';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
const $q = useQuasar();
const profileStore = useProfilesStore();
const activeStore = useActiveStore();
const dialogVote = ref(false);
const planning = ref<ICeremony>();
const doneCb = ref<VoidCallback>();
const errorCb = ref<ErrorCallback>();
const pendingVoters = ref<IProfile[]>([]);
const confidenceVotes = computed(() => {
  return Math.round((planning.value?.confidence || 0) * 100) / 100;
});
const yourVote = ref('');
async function submitVote(vote: string) {
  if (!planning.value) return;
  TheWorkflows.emit({
    type: 'voteForConfidence',
    arg: {
      ceremony: planning.value,
      vote: vote,
      voter: profileStore.theUser?.key || '',
      done: () => {
        dialogVote.value = false;
        doneCb.value && doneCb.value();
      },
      error: (e) => {
        $q.notify({
          message: String(e),
          color: 'negative',
          icon: 'error',
        });
        dialogVote.value = false;
        errorCb.value && errorCb.value(new Error(String(e)));
      },
    },
  });
}
function resetVoting() {
  if (!planning.value || !profileStore.theUser?.key) return;
  TheWorkflows.emit({
    type: 'resetConfidenceVoting',
    arg: {
      ceremony: planning.value,
      moderator: profileStore.theUser.key,
      done: () => {
        dialogVote.value = false;
        doneCb.value && doneCb.value();
      },
      error: (e) => {
        $q.notify({
          message: String(e),
          color: 'negative',
          icon: 'error',
        });
        dialogVote.value = false;
        errorCb.value && errorCb.value(new Error(String(e)));
      },
    },
  });
}
TheDialogs.on({
  type: 'voteForConfidenceDialog',
  async cb(e) {
    planning.value = e.ceremony;
    const convoStore = useConvoStore();
    const votes = (
      await convoStore.ofDiscussion(e.ceremony.iterationKey, e.ceremony.key)
    )
      .filter((c) => c.type == 'vote')
      .sort((a, b) => a.date.localeCompare(b.date)) as IVote[];
    const lastIndex = votes.findLastIndex((v) => v.vote == '0');
    if (lastIndex >= 0) {
      votes.splice(0, lastIndex + 1);
    }
    yourVote.value =
      votes.findLast((v) => entityKey(v.from) == profileStore.theUser?.key)
        ?.vote || '';
    pendingVoters.value = activeStore.activeMembers.filter(
      (m) => !votes.find((v) => entityKey(v.from) == m.key)
    );
    dialogVote.value = true;
  },
});
</script>
<template>
  <q-dialog v-model="dialogVote">
    <q-card
      class="q-pa-sm text-center"
      :style="'min-width:' + $q.screen.sizes.sm + 'px'"
    >
      <q-card-section class="text-right">
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section
        class="row justify-center"
        v-if="!planning?.confidence && !yourVote"
      >
        <q-card
          @click="submitVote(c)"
          class="poker-card bg-grey-9 q-pa-sm text-h5 cursor-pointer q-ma-sm"
          v-for="c in ['1', '2', '3', '4', '5']"
          :key="c"
          style="width: 100px"
          v-ripple.early
        >
          <div class="top-left text-left">
            {{ c }}<br />
            <div style="color: black">♥</div>
          </div>
          <div></div>
          <div></div>
          <div></div>
          <div class="heart">♥</div>
          <div></div>
          <div></div>
          <div></div>
          <div class="bottom-right text-right">
            <div style="color: black">♥</div>
            {{ c }}
          </div>
        </q-card>
      </q-card-section>
      <q-card-section class="row justify-center" v-else>
        <q-card
          class="poker-card bg-grey-9 q-pa-sm text-h5 cursor-pointer q-ma-sm"
          style="width: 100px; height: 150px"
          v-ripple.early
        >
          <div class="absolute-center">
            {{ confidenceVotes || yourVote }}
          </div>
        </q-card>
        <div class="text-title col-12" v-if="confidenceVotes">
          Team Confidence Vote
        </div>
        <div class="text-title col-12" v-else>Your Confidence Vote</div>
      </q-card-section>
      <q-card-actions v-if="!planning?.confidence">
        <q-space />
        <QSpinnerDots size="sm" />
        <recent-active-members :profiles="pendingVoters" :max-count="8" />
        <QSpinnerDots size="sm" />
        <q-space />
      </q-card-actions>
      <q-card-actions v-else-if="activeStore.canUserModerate">
        <q-space />
        <q-btn
          icon="settings_backup_restore"
          color="secondary"
          @click="resetVoting"
          >Reset Voting</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
