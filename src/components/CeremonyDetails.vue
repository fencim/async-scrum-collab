<script lang="ts" setup>
import {
  IQuestion,
  IProgressFeedback,
  IVote,
  Convo,
  IProfile,
  ICeremony,
} from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { useActiveStore } from 'src/stores/active.store';
import { computed, ref, onMounted } from 'vue';
import RecentActiveMembers from './RecentActiveMembers.vue';
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { useProfilesStore } from 'src/stores/profiles.store';
import { ceremonyDetailsSections } from './ceremony/sections';
import { date, useQuasar } from 'quasar';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useConvoStore } from 'src/stores/convo.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { useIterationStore } from 'src/stores/iterations.store';
const props = defineProps<{
  ceremony: ICeremony;
}>();

const convos = ref<Convo[]>([]);
const tab = ref('progress');
const splitterModel = ref(20);

const activeStore = useActiveStore();
const ceremonyStore = useCeremonyStore();
const profileStore = useProfilesStore();
const $q = useQuasar();

onMounted(async () => {
  const convoStore = useConvoStore();
  if (props.ceremony.iterationKey) {
    convos.value = await convoStore.ofDiscussion(
      props.ceremony.iterationKey,
      props.ceremony.key
    );
  }
});
const iterationStore = useIterationStore();
const iteration = computed(() => {
  return iterationStore.iterations.find(
    (i) => props.ceremony.iterationKey == i.key
  );
});
const votes = computed(() => {
  const voteCasts = convos.value
    .filter((c) => c.type == 'vote')
    .sort((a, b) => a.date.localeCompare(b.date)) as IVote[];
  const lastIndex = voteCasts.findLastIndex((v) => v.vote == '0');
  if (lastIndex >= 0) {
    voteCasts.splice(0, lastIndex + 1);
  }
  return voteCasts;
});
const votesPending = computed(() => {
  const voteCasts = votes.value;
  return activeStore.activeMembers.filter(
    (m) => !voteCasts.find((v) => entityKey(v.from) == m.key)
  );
});
const membersVoted = computed(() => {
  const voted = [
    ...new Set(
      votes.value
        .reduce(
          (p, c) => (typeof c.vote == 'undefined' ? [] : p.concat([c])),
          [] as IVote[]
        )
        .map((c) => c.from)
    ),
  ];
  return activeStore.activeMembers.filter((m) =>
    voted.find((v) => entityKey(v) == m.key)
  );
});
const unResolvedQuestions = computed(() => {
  return convos.value.filter(
    (c) => c.type == 'question' && !c.resolved
  ) as IQuestion[];
});
const activeProjectKey = computed<string>(() => {
  return activeStore.activeProject?.key || '';
});
const activeIterationKey = computed(() => {
  const ceremony = props.ceremony;
  return ceremony.iterationKey;
});
const progressReport = computed<IProgressFeedback[]>(() => {
  if (activeStore.activeProject) {
    return ceremonyStore.checkCompleteness(
      props.ceremony,
      [...new Set(activeStore.activeProject.members)],
      convos.value
    );
  }
  return [];
});
function getProfile(profile: string | IProfile) {
  if (typeof profile == 'object') {
    return profile;
  } else {
    return (
      useActiveStore().activeMembers.find((m) => m.key == profile) || {
        avatar: '',
        key: profile,
        name: 'UN',
      }
    );
  }
}
function asProgress(progress: IProgressFeedback) {
  return progress;
}
function pendingVoteClick(profile: IProfile) {
  const user = useProfilesStore().theUser;
  if (user?.key == profile.key) {
    TheDialogs.emit({
      type: 'voteForConfidenceDialog',
      arg: {
        ceremony: props.ceremony,
      },
    });
  }
}
function resetVoting() {
  if (!props.ceremony || !profileStore.theUser?.key) return;
  TheWorkflows.emit({
    type: 'resetConfidenceVoting',
    arg: {
      ceremony: props.ceremony,
      moderator: profileStore.theUser.key,
      error: (e) => {
        $q.notify({
          message: String(e),
          color: 'negative',
          icon: 'error',
        });
      },
    },
  });
}
</script>
<template>
  <q-card :style="{ width: $q.screen.sizes.md + 'px' }">
    <q-toolbar>
      <q-toolbar-title class="bg-grey rounded-borders q-mr-sm">
        <q-chip icon="description" class="text-capitalize">
          {{ iteration?.name || ceremony.iterationKey }}
          {{ ceremony.type }}</q-chip
        >
      </q-toolbar-title>
      <q-btn
        icon="settings_backup_restore"
        flat
        v-if="ceremony.type == 'planning'"
        dense
        class="q-ma-sm"
        @click="resetVoting"
        ><q-tooltip>Reset Voting</q-tooltip></q-btn
      >
      <q-btn v-close-popup flat round dense icon="close" />
    </q-toolbar>
    <q-card-section horizontal>
      <q-card-section>
        <q-icon name="today" />
        {{ date.formatDate(ceremony.start, 'MMM DD, YYYY hh:mm A') }}
      </q-card-section>
      <q-card-section>
        <q-icon name="today" />
        {{ date.formatDate(ceremony.end, 'MMM DD, YYYY hh:mm A') }}
      </q-card-section>
    </q-card-section>
    <template v-for="section in ceremonyDetailsSections" :key="section.type">
      <component
        v-if="ceremony.type == section.type"
        :is="section.component"
        :ceremony="ceremony"
      />
    </template>
    <q-card-section horizontal class="row">
      <template v-if="ceremony.type == 'planning'">
        <q-card-section>
          Pending Votes
          <recent-active-members
            sizes="xs"
            :max-count="15"
            :profiles="votesPending"
            @click-profile="pendingVoteClick"
          />
        </q-card-section>
        <q-card-section>
          Voted
          <recent-active-members sizes="xs" :profiles="membersVoted" />
        </q-card-section>
      </template>
      <q-card-section>
        Unresolved
        <div>
          <q-btn
            round
            size="xs"
            v-for="q in unResolvedQuestions"
            :key="q.key"
            :to="{
              name: 'convo',
              params: {
                project: activeProjectKey,
                iteration: activeIterationKey,
                ceremony: ceremony.key,
                item: '',
              },
              hash: '#' + q.key,
            }"
          >
            <recent-active-members sizes="xs" :profiles="[getProfile(q.from)]">
              <template #profileTooltip="{ profile }">
                <q-tooltip>({{ profile.name }}) {{ q.message }}?</q-tooltip>
              </template>
            </recent-active-members>
          </q-btn>
        </div>
      </q-card-section>
    </q-card-section>
    <q-card-section>
      <q-splitter v-model="splitterModel" style="height: 250px">
        <template v-slot:before>
          <q-tabs v-model="tab" vertical>
            <q-tab name="progress">Progress</q-tab>
          </q-tabs>
        </template>
        <template v-slot:after>
          <q-tab-panels v-model="tab">
            <q-tab-panel name="progress">
              <q-table
                dense
                :rows="progressReport"
                grid
                :rows-per-page-options="[0]"
                hide-bottom
              >
                <template v-slot:item="props">
                  <div class="q-pa-xs col-12">
                    <q-card
                      v-for="row in [asProgress(props.row)]"
                      :key="row.feedback"
                    >
                      <q-card-section class="q-py-xs">
                        <div
                          class="text-bold"
                          :class="
                            /\b(only|no|not)\b/i.test(line)
                              ? 'text-negative'
                              : ''
                          "
                          v-for="line in row.feedback.split('\n')"
                          :key="line"
                        >
                          {{ line }}
                        </div>
                        <q-linear-progress
                          instant-feedback
                          :value="row.progress"
                        >
                          <q-tooltip class="bg-transparent">
                            <q-badge
                              color="white"
                              text-color="accent"
                              :label="
                                (Math.round(row.progress * 100) / 100) * 100 +
                                '%'
                              "
                            />
                          </q-tooltip>
                        </q-linear-progress>
                      </q-card-section>
                    </q-card>
                  </div>
                </template>
              </q-table>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
    </q-card-section>
  </q-card>
</template>
<style></style>
