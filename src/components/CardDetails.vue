<script lang="ts" setup>
import { date } from 'quasar';
import {
  DiscussionItem,
  IQuestion,
  IProgressFeedback,
  IVote,
  Convo,
  IProfile,
} from 'src/entities';
import { entityKey } from 'src/entities/base.entity';
import { useActiveStore } from 'src/stores/active.store';
import { useConvoStore } from 'src/stores/convo.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { PropType, computed, onMounted, ref } from 'vue';
import { formatKey } from './discussion.helper';
import { getProfiles } from 'src/modules/task-board/cards/card-helpers';
import RecentActiveMembers from './RecentActiveMembers.vue';
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { useProfilesStore } from 'src/stores/profiles.store';
import DueDateChipComp from 'src/modules/task-board/cards/DueDateChipComp.vue';
import { discussionDetailsTabs } from './discussion/details';
import { discussionDetailsSections } from './discussion/sections';
const props = defineProps({
  item: {
    required: true,
    type: Object as PropType<DiscussionItem>,
  },
});
const convos = ref<Convo[]>([]);
const task = ref<DiscussionItem>(props.item);
const tab = ref('progress');
const splitterModel = ref(20);
onMounted(async () => {
  const discussionStore = useDiscussionStore();
  const convoStore = useConvoStore();
  task.value = (await discussionStore.getUpdated(props.item.key)) || task.value;
  if (props.item.iteration) {
    convos.value = await convoStore.ofDiscussion(
      entityKey(props.item.iteration),
      props.item.key
    );
  }
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

const votesPending = computed(() => {
  const activeStore = useActiveStore();
  const votes = convos.value.filter((c) => c.type == 'vote') as IVote[];
  return activeStore.activeMembers.filter(
    (m) => !votes.find((v) => entityKey(v.from) == m.key)
  );
});
const membersVoted = computed(() => {
  const activeStore = useActiveStore();
  const voted = [
    ...new Set(
      (convos.value.filter((c) => c.type == 'vote') as IVote[])
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
      activeStore.activeProject.members,
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
function pendingClick(profile: IProfile) {
  const user = useProfilesStore().theUser;
  if (user?.key == profile.key) {
    TheDialogs.emit({
      type: 'agreeOnItemReadiness',
      arg: {
        item: props.item,
      },
    });
  }
}
function pendingVoteClick(profile: IProfile) {
  const user = useProfilesStore().theUser;
  if (user?.key == profile.key) {
    TheDialogs.emit({
      type: 'voteForItemComplexity',
      arg: {
        item: props.item,
        async done() {
          if (props.item.iteration) {
            convos.value = await useConvoStore().ofDiscussion(
              entityKey(props.item.iteration),
              props.item.key
            );
          }
        },
      },
    });
  }
}
function viewItem(task: string | DiscussionItem) {
  const item =
    typeof task == 'string'
      ? useDiscussionStore().discussions.find((d) => d.key == task)
      : task;
  if (item) {
    TheDialogs.emit({
      type: 'viewTask',
      arg: item,
    });
  }
}
</script>
<template>
  <q-card :style="{ width: $q.screen.sizes.md + 'px' }">
    <q-toolbar>
      <q-btn
        v-if="task.parent"
        class="q-pr-xs q-mr-sm"
        icon-right="chevron_left"
        @click="viewItem(task.parent)"
        >{{ formatKey(entityKey(task.parent) || 'KEY')
        }}<q-tooltip>View Parent</q-tooltip>
      </q-btn>
      <q-toolbar-title class="bg-grey rounded-borders">
        <q-chip icon="description"> {{ formatKey(task.key || 'KEY') }}</q-chip>
        <q-btn
          round
          dense
          size="sm"
          icon="edit"
          @click="
            TheDialogs.emit({
              type: 'editTask',
              arg: {
                item: task,
              },
            })
          "
          color="dark"
          v-close-popup
        >
        </q-btn>
        <q-badge class="text-uppercase q-mx-lg">{{ task.type }}</q-badge>
      </q-toolbar-title>
      <recent-active-members
        sizes="xs"
        :profiles="getProfiles(task.assignees)"
      />

      <div class="q-px-sm">
        <q-badge v-if="task.priority" class="q-mr-xs" dense color="primary">{{
          task.priority
        }}</q-badge>
        <due-date-chip-comp :task="task" />
      </div>
      <q-btn
        v-if="task.iteration"
        :to="{
          name: 'convo',
          params: {
            project: task.projectKey,
            iteration: entityKey(task.iteration),
            ceremony: entityKey(task.iteration) + 'plan',
            item: task.key,
          },
        }"
        v-close-popup
        round
        icon="message"
        size="sm"
        ><q-tooltip>Convo</q-tooltip></q-btn
      >
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
    <template v-for="section in discussionDetailsSections" :key="section.type">
      <component
        v-if="task.type == section.type"
        :is="section.component"
        :item="task"
      />
    </template>
    <q-card-section horizontal class="row">
      <q-card-section>
        Agreed
        <recent-active-members sizes="xs" :profiles="membersAgreed" />
      </q-card-section>
      <q-card-section>
        Disagreed
        <recent-active-members
          sizes="xs"
          :profiles="membersDisagreed"
          @click-profile="pendingClick"
        />
      </q-card-section>
      <q-card-section>
        Pending
        <recent-active-members
          sizes="xs"
          :max-count="15"
          :profiles="membersPending"
          @click-profile="pendingClick"
        />
      </q-card-section>
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
            <template v-for="tab in discussionDetailsTabs" :key="tab.name">
              <q-tab :name="tab.name" v-if="task.type == tab.type">{{
                tab.label
              }}</q-tab>
            </template>
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
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </template>
              </q-table>
            </q-tab-panel>
            <template v-for="tab in discussionDetailsTabs" :key="tab.name">
              <q-tab-panel :name="tab.name" v-if="task.type == tab.type">
                <component :is="tab.component" :item="task" />
              </q-tab-panel>
            </template>
          </q-tab-panels>
        </template>
      </q-splitter>
    </q-card-section>
  </q-card>
</template>
<style></style>
