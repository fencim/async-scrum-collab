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
        v-for="link in links"
        :key="link.key"
        :caption="link.caption"
        :title="link.title"
        :icon="link.icon"
        :hide="link.hide"
        :active="link.active || link == activeLink"
        @click="actOn(link)"
      />
      <q-separator />
      <q-item
        clickable
        tag="a"
        :to="`/${activeProject}/${iteration?.key}/${ceremony?.key}/discussion/new`"
      >
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-tooltip>New Discussion Item</q-tooltip>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EssentialLink from 'src/components/EssentialLink.vue';
import { useCeremonyStore } from 'src/stores/cermonies';
import { DiscussionItem, ICeremony, IIteration, IProject } from 'src/entities';
import { useProjectStore } from 'src/stores/projects';
import { useIterationStore } from 'src/stores/iterations';
import { convoBus } from './convo-bus';
import { ActionItem, ticketActionList } from './ceremony.action-list';
import { useDiscussionStore } from 'src/stores/discussions';
import { useProfilesStore } from 'src/stores/profiles';
import { useConvoStore } from 'src/stores/convo';

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
      convoBus,
      discussionStore,
      links: ticketActionList,
      activeLink: undefined as ActionItem | undefined,
      activeProject: 'AP',
      activeIteration: 'AI',
      activeCeremony: 'AC',
      activeItem: '',
      dialogAgree: false,
      project: undefined as IProject | undefined,
      iteration: undefined as IIteration | undefined,
      ceremony: undefined as ICeremony | undefined,
      item: undefined as DiscussionItem | undefined,
    };
  },
  async mounted() {
    await this.init();
    convoBus.on('onQuestion', (e) => {
      this.activateLink('question', e as boolean);
    });
    convoBus.on('onDisagree', (e) => {
      this.activateLink('disagree', e as boolean);
    });
  },
  async updated() {
    await this.init();
  },
  computed: {
    progress() {
      return ceremonyStore.activeCeremonyProgress;
    },
  },
  methods: {
    async init() {
      //project
      this.activeProject =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.project = await projectStore.withKey(this.activeProject);

      //iteration
      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.iteration = await iterationStore.withKey(
        this.activeProject,
        this.activeIteration
      );

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
      this.setLinkVisibility(
        /(vote|attachment|question|record|agree|view|disagree)/i,
        !!this.activeItem
      );
      if (/^(convo|ceremony)$/.test(String(this.$route.name) || '')) {
        this.activateLink('convo');
      } else if (/^(discussionDetails)$/.test(String(this.$route.name) || '')) {
        this.activateLink('view');
      }
    },
    setLinkVisibility(key: string | RegExp, visibility: boolean) {
      this.links.forEach((l) => {
        if (key && new RegExp(key).test(l.key)) {
          l.hide = !visibility;
        }
      });
    },
    activateLink(key: string, active?: boolean) {
      const link = this.links.find((l) => l.key == key);
      if (link) {
        if (typeof active == 'boolean') {
          link.active = active;
        } else {
          this.activeLink = link;
        }
      }
    },
    async actOn(action: ActionItem) {
      if (action.key == 'view') {
        await this.$router.replace({
          name: 'discussionDetails',
          params: {
            project: this.activeProject,
            iteration: this.activeIteration,
            ceremony: this.activeCeremony,
            item: this.activeItem,
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
      } else if (action.key == 'agree') {
        this.item =
          (this.activeItem &&
            (await discussionStore.withKey(this.activeItem))) ||
          undefined;
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
  },
});
</script>
<style></style>
