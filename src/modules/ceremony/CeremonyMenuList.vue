<template>
  <q-list padding class="menu-list" style="overflow-y: auto">
    <q-item
      v-if="ceremonyStore.activeCeremony"
      clickable
      :active="!$route.params.item"
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
        :value="Number(ceremonyStore.activeCeremony.progress) * 100"
        show-value
        font-size="12px"
        class="text-white q-ma-sm text-uppercase"
        size="40px"
        :thickness="0.2"
        color="grey"
        track-color="black"
      >
        {{
          (Number(ceremonyStore.activeCeremony.progress || 0) * 100).toFixed(0)
        }}%
      </q-circular-progress>
      <q-tooltip
        ><div class="text-caption">
          Convo of {{ ceremonyStore.activeCeremony?.type }}
        </div>
        <q-linear-progress
          :value="Number(ceremonyStore.activeCeremony.progress || 0)"
        />
      </q-tooltip>
    </q-item>
    <q-item
      clickable
      v-for="i in topDiscussions"
      :key="i?.key"
      active-class="bg-grey-9"
      :to="{
        name: 'convo',
        params: {
          project: activeProjectKey,
          iteration: activeIterationKey,
          ceremony: activeCeremonyKey,
          item: i?.key,
        },
      }"
    >
      <discussion-menu
        :item="i"
        :description="i.info || ''"
        :reporter="
          i.type == 'scrum' && typeof i.assignedTo == 'object'
            ? i.assignedTo
            : undefined
        "
      />
    </q-item>
    <q-item v-if="topDiscussions.length < discussionItems.length">
      <q-btn round icon="more_vert" @click="expandMenu = true"></q-btn>
    </q-item>
  </q-list>
  <q-dialog v-model="expandMenu" position="left">
    <q-list class="bg-dark">
      <q-item
        v-close-popup
        v-for="element in discussionItems"
        :key="element.key"
        :to="{
          name: 'convo',
          params: {
            project: activeProjectKey,
            iteration: activeIterationKey,
            ceremony: activeCeremonyKey,
            item: element.key,
          },
        }"
      >
        <q-card
          class="list-group-item q-pa-sm board-card no-shadow"
          :class="element.type + '-card'"
          style="width: 200px"
        >
          <component
            :is="getComponent(element)"
            :task="element"
            header-only
            no-action
            mini
          />
        </q-card>
      </q-item>
    </q-list>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ICeremony, IProject } from 'src/entities';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useProjectStore } from 'src/stores/projects.store';
import { computed, onMounted, ref } from 'vue';
import DiscussionMenu from 'src/components/discussion/DiscussionMenu.vue';
import { useProfilesStore } from 'src/stores/profiles.store';
import { useRoute } from 'vue-router';
import { entityKey } from 'src/entities/base.entity';
import { useQuasar } from 'quasar';
import { getComponent } from '../task-board/card-components';
import { useRouter } from 'vue-router';

const projectStore = useProjectStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const profileStore = useProfilesStore();
const $route = useRoute();
const $q = useQuasar();
const $router = useRouter();
const activeProjectKey = ref('');
const activeIterationKey = ref('');
const activeCeremonyKey = ref('');
const activeItemKey = ref('');
const activeProject = ref<IProject>();
const activeCeremony = ref<ICeremony>();
const expandMenu = ref(false);
onMounted(async () => {
  await init();
});
$router.afterEach(async () => {
  await init();
});

async function init() {
  activeProjectKey.value =
    ($route.params.project && String($route.params.project)) || '';
  activeProject.value = projectStore.activeProject;
  activeIterationKey.value = ($route.params.iteration as string) || '';
  activeCeremonyKey.value = ($route.params.ceremony as string) || '';
  activeItemKey.value = ($route.params.item as string) || '';
  activeCeremony.value = await ceremonyStore.withKey(
    activeProjectKey.value,
    activeIterationKey.value,
    activeCeremonyKey.value
  );
  topDiscussions.effect.run();
}
const discussionItems = computed(() => {
  if (!activeCeremony.value) return [];
  const theUser = profileStore.theUser;
  const list = discussionStore.discussionsOf(activeCeremony.value);
  if (activeCeremony.value?.type == 'scrum' && theUser) {
    return list.sort((a) => {
      if (
        a.key == activeItemKey.value ||
        (a.type == 'scrum' &&
          a.assignedTo &&
          entityKey(a.assignedTo) == theUser.key)
      ) {
        return -1;
      }
      return 0;
    });
  }
  return list;
});
const topDiscussions = computed(() => {
  const max = $q.screen.gt.sm ? 5 : 4;
  const menu = [...discussionItems.value];
  const index = menu.findIndex((a) => a.key == activeItemKey.value);
  if (index >= max) {
    const list = menu.sort((a, b) => {
      if (a.key == activeItemKey.value) {
        return -1;
      } else if (b.key == activeItemKey.value) {
        return 1;
      }
      return 0;
    });
    return list.slice(0, max);
  }
  return menu;
});
</script>
<style></style>
