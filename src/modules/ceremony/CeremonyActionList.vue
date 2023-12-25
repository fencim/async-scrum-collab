<template>
  <div>
    <q-dialog v-model="dialogAgree" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="thumb_up_alt" color="primary" text-color="white" />
          <span class="q-ml-sm"
            >You are about to confirm your agreement on discussion.</span
          >
        </q-card-section>
        <q-card-section>{{
          discussionStore.describeDiscussion(item)
        }}</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn push flat label="Yes" color="primary" @click="agreeOnItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
        <q-tooltip v-if="goalIsCreated && objectiveIsCreated"
          >New Discussion Item</q-tooltip
        >
        <q-tooltip
          :self="'center left'"
          class="text-subtitle1"
          v-model="showCreateDiscussionTooltip"
          v-else-if="!goalIsCreated"
          >Create Iteration goals first!</q-tooltip
        >
        <q-tooltip
          :self="'center left'"
          class="text-subtitle1"
          v-model="showCreateDiscussionTooltip"
          v-else
          >Create at least one iteration objective!</q-tooltip
        >
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EssentialLink from 'src/components/EssentialLink.vue';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { DiscussionItem, ICeremony, IIteration, IProject } from 'src/entities';
import { useProjectStore } from 'src/stores/projects.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { convoBus } from './convo-bus';
import { ActionItem } from './ceremony.action-list';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useConvoStore } from 'src/stores/convo.store';
import { TheDialogs } from 'src/dialogs/the-dialogs';

const profileStore = useProfilesStore();
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
      dialogAgree: false,
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
    convoBus.on('onDisagree', (e) => {
      this.convoStore.activateLink('disagree', e as boolean);
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
      return discussionStore.discussions.find((d) => d.type == 'goal');
    },
    objectiveIsCreated() {
      return discussionStore.discussions.find((d) => d.type == 'objective');
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
    },

    async actOn(action: ActionItem) {
      if (action.key == 'view') {
        const discusssion = await discussionStore.withKey(this.activeItem);
        discusssion && TheDialogs.emit({ type: 'viewTask', arg: discusssion });
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
      } else if (action.key == 'agree') {
        this.dialogAgree = true;
      } else {
        convoBus.emit(action.key);
      }
    },
    async agreeOnItem() {
      if (this.item && profileStore.presentUser && this.project) {
        this.item.awareness = this.item.awareness || {};
        this.item.awareness[profileStore.presentUser.key] = 'agree';
        await discussionStore.saveDiscussion(this.item);
      }
      await convoStore.sendMessage(
        this.activeProject,
        this.activeItem || this.activeCeremony,
        profileStore.presentUser?.key || '',
        {
          type: 'message',
          message: 'I agree this disussion item is ready',
        }
      );
      this.dialogAgree = false;
      convoBus.emit('refresh');
    },
    async newDiscussion() {
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
          },
        });
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
