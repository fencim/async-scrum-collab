<template>
  <q-list padding class="menu-list">
    <EssentialLink
      v-for="link in links"
      :key="link.key"
      :caption="link.caption"
      :title="link.title"
      :icon="link.icon"
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EssentialLink from 'src/components/EssentialLink.vue';
import { useCeremonyStore } from 'src/stores/cermonies';
import { ICeremony, IIteration, IProject } from 'src/entities';
import { useProjectStore } from 'src/stores/projects';
import { useIterationStore } from 'src/stores/iterations';
import { convoBus } from './convo-bus';
type ActionItem = {
  key: string;
  title: string;
  caption: string;
  icon: string;
  link?: string;
  active?: boolean;
};

const ticketActionList: ActionItem[] = [
  {
    key: 'view',
    title: 'View Ticket',
    caption: 'View Details',
    icon: 'info',
  },
  {
    key: 'convo',
    title: 'Conversation',
    caption: 'Activity',
    icon: 'chat',
    link: '',
  },
  {
    key: 'vote',
    title: 'Vote',
    caption: 'Vote Story Point',
    icon: 'poll',
    link: '',
  },
  {
    key: 'attachment',
    title: 'Attachments',
    caption: 'Download',
    icon: 'attachment',
    link: '',
  },
  {
    key: 'record',
    title: 'Record Audio',
    caption: 'send recoded message',
    icon: 'mic',
    link: '',
  },
  {
    key: 'question',
    title: 'Raise Concern',
    caption: 'Raise Concern',
    icon: 'question_mark',
    link: '',
  },
  {
    key: 'approve',
    title: 'Approve Ticket',
    caption: 'Approve Ticket',
    icon: 'thumb_up_alt',
    link: '',
  },
];

const projectStore = useProjectStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();

export default defineComponent({
  name: 'CeremonyActionList',
  components: { EssentialLink },
  data() {
    return {
      convoBus,
      links: ticketActionList,
      activeLink: undefined as ActionItem | undefined,
      activeProject: 'AP',
      activeIteration: 'AI',
      activeCeremony: 'AC',
      activeItem: '',
      project: undefined as IProject | undefined,
      iteration: undefined as IIteration | undefined,
      ceremony: undefined as ICeremony | undefined,
    };
  },
  async mounted() {
    await this.init();
    convoBus.on('onQuestion', (e) => {
      const link = this.links.find((l) => l.key == 'question');
      if (link) {
        link.active = e as boolean;
      }
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

      if (/^(convo|ceremony)$/.test(String(this.$route.name) || '')) {
        this.activateLink('convo');
      } else if (/^(discussionDetails)$/.test(String(this.$route.name) || '')) {
        this.activateLink('view');
      }
    },
    activateLink(key: string) {
      const link = this.links.find((l) => l.key == key);
      if (link) {
        this.activeLink = link;
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
      } else {
        convoBus.emit(action.key);
      }
    },
  },
});
</script>
<style></style>
