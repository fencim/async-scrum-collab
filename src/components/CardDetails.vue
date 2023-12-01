<script lang="ts" setup>
import { date } from 'quasar';
import {
  DiscussionItem,
  IQuestion,
  TechnicalTask,
  IProgressFeedback,
  IVote,
} from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { useActiveStore } from 'src/stores/active.store';
import { useConvoStore } from 'src/stores/convo.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { PropType, computed } from 'vue';
const acceptanceCriteriaColumns = [
  {
    name: 'given',
    label: 'Given',
    field: 'given',
  },
  {
    name: 'when',
    label: 'When',
    field: 'when',
  },
  {
    name: 'then',
    label: 'Then',
    field: 'then',
  },
];
const props = defineProps({
  item: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
});
const subTasks = computed(() => {
  const discussionStore = useDiscussionStore();
  const item = props.item;
  if (item.type == 'story') {
    const listKeys = (item.tasks || []).filter(
      (t) => typeof t == 'string'
    ) as string[];
    const listTasks = (item.tasks || []).filter(
      (t) => typeof t == 'object'
    ) as TechnicalTask[];
    return [...listTasks, ...discussionStore.fromList(listKeys)];
  }
  return [];
});
const membersAgreed = computed(() => {
  const activeStore = useActiveStore();
  const awareness = props.item.awareness || {};
  return activeStore.activeMembers.filter((m) => awareness[m.key] == 'agree');
});
const membersDisagreed = computed(() => {
  const activeStore = useActiveStore();
  const awareness = props.item.awareness || {};
  return activeStore.activeMembers.filter(
    (m) => awareness[m.key] == 'disagree'
  );
});
const membersPending = computed(() => {
  const activeStore = useActiveStore();
  const awareness = props.item.awareness || {};
  const awareMembers = Object.keys(awareness);
  return activeStore.activeMembers.filter((m) => !awareMembers.includes(m.key));
});
const membersVoted = computed(() => {
  const convo = useConvoStore().convo;
  const activeStore = useActiveStore();
  const voted = [
    ...new Set(
      (convo.filter((c) => c.type == 'vote') as IVote[])
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
const unResolvedQuestions = computed<IQuestion[]>(() => {
  return [];
});
const activeProjectKey = computed<string>(() => {
  const activeStore = useActiveStore();
  return activeStore.activeProject?.key || '';
});
const activeIterationKey = computed(() => {
  const item = props.item;
  return (
    (typeof item.iteration == 'string'
      ? item.iteration
      : item.iteration?.key) || ''
  );
});
const activeItemKey = computed<string>(() => {
  return props.item.key;
});
const activeCeremonyKey = computed<string>(() => {
  return activeIterationKey.value + 'planning';
});
const progressReport = computed<IProgressFeedback[]>(() => {
  const activeStore = useActiveStore();
  const discussionStore = useDiscussionStore();
  const convoStore = useConvoStore();
  if (activeStore.activeProject) {
    return discussionStore.checkCompleteness(
      props.item,
      activeStore.activeProject,
      convoStore.convo
    );
  }
  return [];
});
function asProgress(progress: IProgressFeedback) {
  return progress;
}
</script>
<template>
  <q-card>
    <q-toolbar>
      <q-space />
      <q-btn v-close-popup flat round dense icon="close" />
    </q-toolbar>
    <q-card-section horizontal>
      <q-card-section> Description </q-card-section>
      <q-card-section v-if="item.complexity !== undefined">
        <q-badge class="text-h3">{{ item.complexity }}</q-badge>
      </q-card-section>
    </q-card-section>
    <q-card-section
      v-if="item.type == 'goal' || item.type == 'task'"
      class="row"
    >
      {{ item.description }}
    </q-card-section>
    <q-card-section v-else-if="item.type == 'objective'" class="row">
      <div class="col-12">
        <strong>Description:</strong> {{ item.description }}
      </div>
      <div class="col-12"><strong>Specifics:</strong> {{ item.specifics }}</div>
      <div class="col-12"><strong>Measures:</strong> {{ item.mesures }}</div>
      <div class="col-12"><strong>Enables:</strong> {{ item.enables }}</div>
      <div class="col-12">
        <strong>Due:</strong>
        {{ date.formatDate(item.dueDate, 'MMM D, YYYY') }}
      </div>
    </q-card-section>
    <q-card-section v-else-if="item.type == 'story'" class="row">
      {{ item.targetUser }}
      {{ item.subject }}
      {{ item.purpose }}

      <q-table
        title="Acceptance Criteria"
        class="col-12"
        :rows="item.acceptanceCriteria"
        :columns="acceptanceCriteriaColumns"
      >
      </q-table>
      <q-table
        v-if="item.tasks && item.tasks.length"
        title="Sub-Tasks"
        class="col-12"
        :rows="subTasks"
      >
      </q-table>
    </q-card-section>
    <q-card-section horizontal>
      <q-card-section>
        Agreed
        <recent-active-members sizes="xs" :profiles="membersAgreed" />
      </q-card-section>
      <q-card-section>
        Disgreed
        <recent-active-members sizes="xs" :profiles="membersDisagreed" />
      </q-card-section>
      <q-card-section>
        Pending
        <recent-active-members sizes="xs" :profiles="membersPending" />
      </q-card-section>
      <q-card-section>
        Voted
        <recent-active-members sizes="xs" :profiles="membersVoted" />
      </q-card-section>
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
                ceremony: activeCeremonyKey,
                item: activeItemKey,
              },
              hash: '#' + q.key,
            }"
          >
            <q-avatar size="xs">
              <img v-if="typeof q.from == 'object'" :src="q.from.avatar" />
              <q-icon v-else name="question_mark" />
            </q-avatar>
            <q-tooltip>{{ q.message }}?</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card-section>
    <q-card-section>
      <q-table
        title="Progress"
        :rows="progressReport"
        grid
        :rows-per-page-options="[0]"
        hide-bottom
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-12">
            <q-card v-for="row in [asProgress(props.row)]" :key="row.feedback">
              <q-card-section class="q-py-xs">
                <div
                  class="text-bold"
                  :class="
                    /\b(only|no|not)\b/i.test(line) ? 'text-negative' : ''
                  "
                  v-for="line in row.feedback.split('\n')"
                  :key="line"
                >
                  {{ line }}
                </div>
                <q-linear-progress instant-feedback :value="row.progress" />
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<style></style>
