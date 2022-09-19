<template>
  <q-list padding class="menu-list">
    <q-item
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
        :value="progress * 100"
        show-value
        font-size="12px"
        class="text-white q-ma-sm text-uppercase"
        size="40px"
        :thickness="0.3"
        color="grey"
        track-color="transparent"
      >
        {{ (progress * 100).toFixed(0) }}%
      </q-circular-progress>
      <q-tooltip
        ><div class="text-caption">Convo of {{ activeCeremony?.type }}</div>
        <q-linear-progress :value="progress" />
      </q-tooltip>
    </q-item>
    <q-item
      clickable
      v-for="i in discussionItems"
      :key="i?.key"
      active-class="bg-grey-9"
      :active="i?.key == activeItemKey"
      :to="`/${activeProjectKey}/${activeIterationKey}/${activeCeremonyKey}/${i?.key}/convo`"
    >
      <q-circular-progress
        :value="(i?.progress || 0) * 100"
        show-value
        font-size="12px"
        class="text-white q-ma-sm text-uppercase"
        size="40px"
        :thickness="0.15"
        color="grey"
        track-color="transparent"
      >
        {{ i?.projectKey }}{{ (i.key.match(/\d+$/) || [])[0] }}
        <q-badge color="red" v-if="i?.unread" floating>{{ i?.unread }}</q-badge>
      </q-circular-progress>
      <q-tooltip
        ><div class="text-caption">
          {{ discussionStore.describeDiscussion(i) }}
        </div>
        <q-linear-progress :value="i.progress" />
      </q-tooltip>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { DiscussionItem, ICeremony, IProject } from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
import { convoBus } from './convo-bus';

const projectStore = useProjectStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();

export default defineComponent({
  name: 'CeremonyMenuList',
  components: {},
  data() {
    return {
      discussionStore,
      activeProjectKey: 'AP',
      activeIterationKey: 'AI',
      activeCeremonyKey: 'AC',
      activeItemKey: '0',
      activeProject: undefined as IProject | undefined,
      activeCeremony: undefined as ICeremony | undefined,
      discussionItems: [] as DiscussionItem[],
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
  computed: {
    progress() {
      return ceremonyStore.activeCeremonyProgress;
    },
  },
  methods: {
    async init() {
      this.activeProjectKey =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.activeProject = projectStore.activeProject;
      this.activeIterationKey =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.activeCeremonyKey =
        (this.$route.params.ceremony && String(this.$route.params.ceremony)) ||
        '';
      this.activeCeremony = await ceremonyStore.withKey(
        this.activeProjectKey,
        this.activeIterationKey,
        this.activeCeremonyKey
      );
      this.activeItemKey =
        (this.$route.params.item && String(this.$route.params.item)) || '';
      this.discussionItems = await Promise.all(
        await discussionStore.fromKeyList(
          this.activeProjectKey,
          this.activeCeremony?.discussions || []
        )
      );
      if (this.activeCeremony) {
        const progress =
          this.discussionItems.reduce((p, c) => p + (c.progress || 0), 0) /
          Math.max(this.discussionItems.length, 1);
        if (progress !== this.activeCeremony.progress) {
          this.activeCeremony.progress = progress;
          await ceremonyStore.saveCeremony(this.activeCeremony);
        }
        ceremonyStore.setActiveCeremony(this.activeCeremony);
      }
    },
  },
});
</script>
<style></style>
