<template>
  <div>
    <q-list padding class="menu-list">
      <EssentialLink
        v-for="link in convoStore.actions"
        :key="link.key"
        :caption="link.caption"
        :title="link.title"
        :icon="link.icon"
        :hide="link.hide"
        :class="{ shake: !!link.emphasize }"
        :active="link.active || link == convoStore.activeAction"
        @click="actOn(link)"
      />
      <q-separator />
      <q-item
        clickable
        :to="{
          name: 'board',
          params: {
            project: project?.key,
          },
        }"
      >
        <q-item-section avatar>
          <q-icon name="dashboard" />
        </q-item-section>
        <q-tooltip>Task board</q-tooltip>
      </q-item>
      <q-item
        clickable
        :to="{
          name: 'burn-down',
          params: {
            project: project?.key || activeProject,
            iteration: iteration?.key || activeIteration,
          },
        }"
      >
        <q-item-section avatar>
          <q-icon name="trending_down" />
        </q-item-section>
        <q-tooltip>Burn Down</q-tooltip>
      </q-item>
      <q-separator />
      <q-item clickable dense tag="a" @click="newDiscussion">
        <q-item-section avatar>
          <q-icon name="add" size="sm" />
        </q-item-section>
        <q-tooltip v-if="ceremony?.type == 'scrum'"
          >Report your Daily Scum</q-tooltip
        >
        <q-tooltip v-else-if="goalIsCreated && objectiveIsCreated"
          >New Discussion Item</q-tooltip
        >
        <q-tooltip
          :self="'center left'"
          class="text-subtitle1"
          v-model="showCreateDiscussionTooltip"
          v-else-if="!goalIsCreated && ceremony?.type == 'planning'"
          >Create Iteration goals first!</q-tooltip
        >
        <q-tooltip
          :self="'center left'"
          class="text-subtitle1"
          v-model="showCreateDiscussionTooltip"
          v-else-if="ceremony?.type == 'planning'"
          >Create at least one iteration objective!</q-tooltip
        >
        <q-tooltip
          :self="'center left'"
          class="text-subtitle1 text-capitalize"
          v-model="showCreateDiscussionTooltip"
          v-else
          >Create {{ ceremony?.type }} Discussion Item</q-tooltip
        >
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EssentialLink from 'src/components/EssentialLink.vue';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import {
  DiscussionItem,
  ICeremony,
  IIteration,
  IProject,
  RetroItem,
} from 'src/entities';
import { useProjectStore } from 'src/stores/projects.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { convoBus } from './convo-bus';
import { ActionItem } from './ceremony.action-list';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useConvoStore } from 'src/stores/convo.store';
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { entityKey } from 'src/entities/base.entity';
import { useProfilesStore } from 'src/stores/profiles.store';

const projectStore = useProjectStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const convoStore = useConvoStore();

export default defineComponent({
  name: 'CeremonyActionList',
  components: { EssentialLink },
  data() {
    return {
      TheDialogs,
      convoBus,
      discussionStore,
      convoStore,
      activeProject: 'AP',
      activeIteration: 'AI',
      activeCeremony: 'AC',
      activeItem: '',
      project: undefined as IProject | undefined,
      iteration: undefined as IIteration | undefined,
      ceremony: undefined as ICeremony | undefined,
      item: undefined as DiscussionItem | undefined,
      showCreateDiscussionTooltip: false,
    };
  },
  async mounted() {
    await this.init();
    convoBus.on('onQuestion', (e) => {
      this.convoStore.activateLink('question', e as boolean);
    });
  },
  async updated() {
    await this.init();
  },
  computed: {
    progress() {
      return ceremonyStore.activeCeremonyProgress;
    },
    goalIsCreated() {
      const iteration = this.iteration;
      return discussionStore.discussions.find(
        (d) =>
          d.type == 'goal' &&
          d.iteration &&
          iteration &&
          entityKey(d.iteration) == entityKey(iteration)
      );
    },
    objectiveIsCreated() {
      const iteration = this.iteration;
      return discussionStore.discussions.find(
        (d) =>
          d.type == 'objective' &&
          d.iteration &&
          iteration &&
          entityKey(d.iteration) == entityKey(iteration)
      );
    },
  },
  methods: {
    async init() {
      //project
      this.activeProject =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.project = projectStore.activeProject;

      //iteration
      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.iteration = iterationStore.activeIteration;

      //ceremony
      this.activeCeremony =
        (this.$route.params.ceremony && String(this.$route.params.ceremony)) ||
        '';
      this.ceremony = await ceremonyStore.withKey(
        this.activeProject,
        this.activeIteration,
        this.activeCeremony
      );

      this.activeItem =
        (this.$route.params.item && String(this.$route.params.item)) || '';

      this.item =
        (this.activeItem && (await discussionStore.withKey(this.activeItem))) ||
        undefined;
      if (this.item && !this.iteration) {
        this.iteration = this.item.iteration as IIteration;
      }
      if (this.item?.type == 'scrum') {
        this.convoStore.setLinkVisibility(
          /(attachment|question|record|agree|view|disagree)/i,
          !!this.activeItem
        );
      } else {
        this.convoStore.setLinkVisibility(
          /(vote|attachment|question|record|agree|view|disagree)/i,
          !!this.activeItem
        );
      }
      if (/^(convo|ceremony)$/.test(String(this.$route.name) || '')) {
        this.convoStore.activateLink('convo');
      } else if (/^(discussionDetails)$/.test(String(this.$route.name) || '')) {
        this.convoStore.activateLink('view');
      }
      this.showCreateDiscussionTooltip =
        !this.goalIsCreated || !this.objectiveIsCreated;
      this.convoStore.setLinkVisibility(
        /^(planning-presentation|confidence)$/i,
        this.ceremony?.type == 'planning'
      );
      this.convoStore.setLinkVisibility(
        /^(review-presentation)$/i,
        this.ceremony?.type == 'review'
      );
    },
    async actOn(action: ActionItem) {
      const discussion = await discussionStore.withKey(this.activeItem);
      if (action.key == 'view') {
        discussion && TheDialogs.emit({ type: 'viewTask', arg: discussion });
      } else if (action.key == 'vote') {
        const discussion = await discussionStore.withKey(this.activeItem);
        discussion &&
          TheDialogs.emit({
            type: 'voteForItemComplexity',
            arg: {
              item: discussion,
            },
          });
      } else if (action.key == 'convo') {
        await this.$router.replace({
          name: 'convo',
          params: {
            project: this.activeProject,
            iteration: this.activeIteration,
            ceremony: this.activeCeremony,
            item: this.activeItem,
          },
        });
      } else if (
        (action.key == 'agree' || action.key == 'disagree') &&
        discussion
      ) {
        this.agreeOnItem();
      } else if (action.key == 'planning-presentation' && this.iteration) {
        TheDialogs.emit({
          type: 'playPlanningPresentation',
          arg: {
            iteration: this.iteration,
          },
        });
      } else if (action.key == 'review-presentation' && this.iteration) {
        TheDialogs.emit({
          type: 'playReviewPresentation',
          arg: {
            iteration: this.iteration,
          },
        });
      } else if (action.key == 'confidence' && this.ceremony) {
        TheDialogs.emit({
          type: 'voteForConfidenceDialog',
          arg: {
            ceremony: this.ceremony,
          },
        });
      } else if (action.key == 'progress' && this.ceremony) {
        TheDialogs.emit({
          type: 'viewCeremonyProgress',
          arg: {
            ceremony: this.ceremony,
          },
        });
      } else {
        convoBus.emit(action.key);
      }
    },
    async agreeOnItem() {
      if (!this.item) return;
      TheDialogs.emit({
        type: 'agreeOnItemReadiness',
        arg: {
          item: this.item,
        },
      });
    },
    async newPlanningDiscussion() {
      const goalCreated = this.goalIsCreated;
      if (
        this.item &&
        (['objective', 'goal', 'story'] as DiscussionItem['type'][]).includes(
          this.item.type
        )
      ) {
        TheDialogs.emit({
          type: 'newSubTask',
          arg: {
            ref: this.item,
            done: (item) => {
              this.$router.replace({
                name: 'convo',
                params: {
                  project: this.activeProject,
                  iteration: this.activeIteration,
                  ceremony: this.activeCeremony,
                  item: item.key,
                },
              });
            },
          },
        });
      } else {
        TheDialogs.emit({
          type: 'newTask',
          arg: {
            type: !goalCreated
              ? 'goal'
              : !this.objectiveIsCreated
              ? 'objective'
              : 'story',
            iteration: this.iteration,
            done: (item) => {
              this.$router.replace({
                name: 'convo',
                params: {
                  project: this.activeProject,
                  iteration: this.activeIteration,
                  ceremony: this.activeCeremony,
                  item: item.key,
                },
              });
            },
            error: (err) => {
              this.$q.notify({
                color: 'negative',
                icon: 'error',
                message: String(err),
              });
            },
          },
        });
      }
    },
    async newRetroDiscussion() {
      if (!this.iteration) return;
      const discussing = discussionStore.discussions.filter(
        (d) => d.ceremonyKey == this.ceremony?.key
      );
      let discussionType: RetroItem['type'] | undefined;
      if (!discussing.find((d) => d.type == 'went-well')) {
        discussionType = 'went-well';
      } else if (!discussing.find((d) => d.type == 'went-wrong')) {
        discussionType = 'went-wrong';
      } else if (!discussing.find((d) => d.type == 'to-improve')) {
        discussionType = 'to-improve';
      } else if (!discussing.find((d) => d.type == 'action-item')) {
        discussionType = 'action-item';
      }
      if (discussionType) {
        TheDialogs.emit({
          type: 'newTask',
          arg: {
            iteration: this.iteration,
            type: discussionType,
            done: (item) => {
              this.$router.replace({
                name: 'convo',
                params: {
                  project: this.activeProject,
                  iteration: this.activeIteration,
                  ceremony: this.activeCeremony,
                  item: item.key,
                },
              });
            },
          },
        });
      }
    },
    newScrumDiscussion() {
      const existing = discussionStore.discussions.find(
        (d) =>
          d.type == 'scrum' &&
          d.ceremonyKey == this.ceremony?.key &&
          d.assignedTo &&
          entityKey(d.assignedTo) == useProfilesStore().theUser?.key
      );
      if (existing) {
        this.$q.notify({
          icon: 'warning',
          message: 'Report already exist',
          actions: [
            {
              icon: 'open',
              label: 'Open',
              to: {
                name: 'convo',
                params: {
                  project: this.project?.key,
                  iteration: this.iteration?.key,
                  ceremony: this.ceremony?.key,
                  item: existing.key,
                },
              },
            },
          ],
        });
        return;
      }
      TheDialogs.emit({
        type: 'newTask',
        arg: {
          type: 'scrum',
          iteration: this.iteration,
          done: (item) => {
            this.$router.replace({
              name: 'convo',
              params: {
                project: this.activeProject,
                iteration: this.activeIteration,
                ceremony: this.activeCeremony,
                item: item.key,
              },
            });
          },
          error: (err) => {
            this.$q.notify({
              color: 'negative',
              icon: 'error',
              message: String(err),
            });
          },
        },
      });
    },
    async newDiscussion() {
      if (this.ceremony?.type == 'planning') {
        this.newPlanningDiscussion();
      } else if (this.ceremony?.type == 'scrum') {
        this.newScrumDiscussion();
      } else if (this.ceremony?.type == 'retro') {
        this.newRetroDiscussion();
      }
    },
  },
});
</script>
<style>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
