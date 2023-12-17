<template>
  <q-list padding class="menu-list">
    <q-item
      v-if="activeCeremony"
      clickable
      :active="!activeItemKey"
      active-class="bg-grey-9"
      :to="{
        name: 'ceremony',
        params: {
          project: activeProjectKey,
          iteration: activeIterationKey,
          ceremony: activeCeremonyKey,
        },
      }"
    >
      <q-circular-progress
        :value="Number(activeCeremony.progress) * 100"
        show-value
        font-size="12px"
        class="text-white q-ma-sm text-uppercase"
        size="40px"
        :thickness="0.2"
        color="grey"
        track-color="black"
      >
        {{ (Number(activeCeremony.progress || 0) * 100).toFixed(0) }}%
      </q-circular-progress>
      <q-tooltip
        ><div class="text-caption">Convo of {{ activeCeremony?.type }}</div>
        <q-linear-progress :value="Number(activeCeremony.progress || 0)" />
      </q-tooltip>
    </q-item>
    <q-item
      clickable
      v-for="i in discussionItems()"
      :key="i?.key"
      active-class="bg-grey-9"
      :active="i?.key == activeItemKey"
      :to="`/${activeProjectKey}/${activeIterationKey}/${activeCeremonyKey}/${i?.key}/convo`"
    >
      <discussion-menu
        :item="i"
        :description="i.info || ''"
        :reporter="
          i.type == 'scrum' && typeof i.reporter == 'object'
            ? i.reporter
            : undefined
        "
      />
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { ICeremony, IProject } from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
import { convoBus } from './convo-bus';
import DiscussionMenu from 'src/components/discussion/DiscussionMenu.vue';
import { useProfilesStore } from 'src/stores/profiles.store';

const projectStore = useProjectStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const profileStore = useProfilesStore();

export default defineComponent({
  name: 'CeremonyMenuList',
  components: { DiscussionMenu },
  data() {
    return {
      discussionStore,
      activeProjectKey: '',
      activeIterationKey: '',
      activeCeremonyKey: '',
      activeItemKey: '',
      activeProject: undefined as IProject | undefined,
      activeCeremony: undefined as ICeremony | undefined,
    };
  },
  mounted() {
    this.init();
    convoBus.on('progressed', this.init);
  },
  unmounted() {
    convoBus.off('progressed', this.init);
  },
  updated() {
    this.init();
  },
  methods: {
    async init() {
      this.activeProjectKey =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.activeProject = projectStore.activeProject;
      this.activeIterationKey = (this.$route.params.iteration as string) || '';
      this.activeCeremonyKey = (this.$route.params.ceremony as string) || '';
      this.activeItemKey = (this.$route.params.item as string) || '';
      this.activeCeremony = await ceremonyStore.withKey(
        this.activeProjectKey,
        this.activeIterationKey,
        this.activeCeremonyKey
      );
      if (this.activeProjectKey) {
        discussionStore.ofProject(this.activeProjectKey);
      }
    },
    discussionItems() {
      const list = discussionStore.fromIteration(
        this.activeProjectKey,
        this.activeIterationKey
      );
      const theUser = profileStore.theUser;
      if (this.activeCeremony?.type == 'scrum' && theUser) {
        return list.sort((a) => {
          if (
            a.type == 'scrum' &&
            (a.reporter == theUser.key ||
              (typeof a.reporter == 'object' && a.reporter.key == theUser.key))
          ) {
            return -1;
          }
          return 0;
        });
      }
      return list;
    },
  },
});
</script>
<style></style>
