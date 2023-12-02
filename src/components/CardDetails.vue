<script lang="ts" setup>
import { date } from 'quasar';
import {
  DiscussionItem,
  IQuestion,
  TechnicalTask,
  IProgressFeedback,
  IVote,
  Convo,
} from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { useActiveStore } from 'src/stores/active.store';
import { useConvoStore } from 'src/stores/convo.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { PropType, computed, onMounted, ref } from 'vue';
import { formatKey } from './discussion.helper';
import { getProfiles } from 'src/modules/task-board/cards/card-helpers';
import RecentActiveMembers from './RecentActiveMembers.vue';
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
let convo: Convo[] = [];
const task = ref<DiscussionItem>(props.item);
onMounted(async () => {
  const discussionStore = useDiscussionStore();
  const activeStore = useActiveStore();
  const convoStore = useConvoStore();
  task.value = (await discussionStore.getUpdated(props.item.key)) || task.value;
  if (activeStore.activeProject?.key) {
    convoStore
      .ofDiscussion(activeStore.activeProject?.key, props.item.key)
      .subscribe({
        next: (messages) => {
          convo = messages;
        },
      });
  }
});

const subTasks = computed(() => {
  const discussionStore = useDiscussionStore();
  const task = props.item;
  if (task.type == 'story') {
    const listKeys = (task.tasks || []).filter(
      (t) => typeof t == 'string'
    ) as string[];
    const listTasks = (task.tasks || []).filter(
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
  const task = props.item;
  return (
    (typeof task.iteration == 'string'
      ? task.iteration
      : task.iteration?.key) || ''
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
  if (activeStore.activeProject) {
    return discussionStore.checkCompleteness(
      props.item,
      activeStore.activeProject,
      convo
    );
  }
  return [];
});
function asProgress(progress: IProgressFeedback) {
  return progress;
}
</script>
<template>
  <q-card :style="{ width: $q.screen.sizes.md + 'px' }">
    <q-toolbar>
      <q-btn flat class="text-h6" dense color="primary">
        {{ formatKey(task.key || 'KEY') }}
      </q-btn>
      <q-space />
      <recent-active-members
        sizes="xs"
        :profiles="getProfiles(task.assignees)"
      />
      <q-space />
      <div class="q-px-sm">
        <q-badge class="q-mr-xs" dense color="primary">{{
          task.priority || 'P1'
        }}</q-badge>
        <q-badge dense :color="task.dueDate ? 'secondary' : 'negative'">{{
          task.dueDate || 'ND'
        }}</q-badge>
      </div>
      <q-btn v-close-popup flat round dense icon="close" />
    </q-toolbar>
    <q-card-section horizontal>
      <q-card-section v-if="task.info"> {{ task.info }} </q-card-section>
      <q-card-section class="row justify-end">
        <q-badge v-if="typeof task.iteration == 'object'" dense>{{
          task.iteration.name || task.iteration
        }}</q-badge>
        <q-space />
        <q-badge v-if="task.complexity" class="text-h6 on-right">{{
          task.complexity
        }}</q-badge>
      </q-card-section>
    </q-card-section>
    <q-card-section
      v-if="task.type == 'goal' || task.type == 'task'"
      class="row"
    >
      {{ task.description }}
    </q-card-section>
    <q-card-section v-else-if="task.type == 'objective'" class="row">
      <div class="col-12">
        <strong>Description:</strong> {{ task.description }}
      </div>
      <div class="col-12"><strong>Specifics:</strong> {{ task.specifics }}</div>
      <div class="col-12"><strong>Measures:</strong> {{ task.mesures }}</div>
      <div class="col-12"><strong>Enables:</strong> {{ task.enables }}</div>
      <div class="col-12">
        <strong>Due:</strong>
        {{ date.formatDate(task.dueDate, 'MMM D, YYYY') }}
      </div>
    </q-card-section>
    <q-card-section v-else-if="task.type == 'story'" class="row">
      {{ task.targetUser }}
      {{ task.subject }}
      {{ task.purpose }}
      <q-table
        title="Acceptance Criteria"
        class="col-12"
        :rows="task.acceptanceCriteria"
        :columns="acceptanceCriteriaColumns"
      >
      </q-table>
      <q-table
        v-if="task.tasks && task.tasks.length"
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
