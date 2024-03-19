<template>
  <q-layout
    view="hHh Lpr lff"
    :style="!$q.platform.is.desktop ? 'zoom: 75%' : ''"
  >
    <q-header reveal elevated>
      <div class="row bg-dark">
        <router-view name="header" />
      </div>
    </q-header>

    <q-drawer
      persistent
      v-model="leftDrawerOpen"
      behavior="desktop"
      mini
      side="left"
      class="no-scroll"
    >
      <router-view name="menu" />
    </q-drawer>
    <q-drawer
      v-model="rightDrawerOpen"
      persistent
      behavior="desktop"
      overlay
      mini
      side="right"
    >
      <router-view name="actions" />
      <q-page-sticky
        v-if="!/^(ceremony|convo)$/.test(String($route.name))"
        position="bottom-right"
        :offset="[5, 20]"
      >
        <q-btn round size="lg" dense icon="home" to="/" />
      </q-page-sticky>
    </q-drawer>

    <q-page-container style="padding-right: 56px">
      <router-view />
      <DiscussionDetailsDialog />
      <DiscussionFormDialog />
      <IterationFormDialog />
      <ProjectFormDialog />
      <ScrumGuideDialog />
      <VoteForComplexityDialog />
      <AgreeOnItemReadinessDialog />
      <PlanningPresentationDialog />
      <VoteForConfidenceDialog />
      <ReviewPresentationDialog />
      <CeremonyDetailsDialog />
      <CeremonyFormDialog />
      <ConfirmToDeleteDiscussionDialog />
      <ConfirmToDeleteIterationDialog />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { onMounted, onUpdated, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DiscussionItem, ICeremony, ILoggable } from 'src/entities';
import { Iteration } from 'src/workflows/iteration/definition';
import { Discussion } from 'src/workflows/discussion/definition';
import DiscussionFormDialog from 'src/dialogs/discussion/DiscussionFormDialog.vue';
import DiscussionDetailsDialog from 'src/dialogs/discussion/DiscussionDetailsDialog.vue';
import IterationFormDialog from 'src/dialogs/iteration/IterationFormDialog.vue';
import ProjectFormDialog from 'src/dialogs/project/ProjectFormDialog.vue';
import ScrumGuideDialog from 'src/dialogs/guide/ScrumGuideDialog.vue';
import VoteForComplexityDialog from 'src/dialogs/discussion/VoteForComplexityDialog.vue';
import AgreeOnItemReadinessDialog from 'src/dialogs/discussion/AgreeOnItemReadinessDialog.vue';
import VoteForConfidenceDialog from 'src/dialogs/discussion/VoteForConfidenceDialog.vue';
import PlanningPresentationDialog from 'src/dialogs/discussion/PlanningPresentationDialog.vue';
import ReviewPresentationDialog from 'src/dialogs/discussion/ReviewPresentationDialog.vue';
import CeremonyDetailsDialog from 'src/dialogs/discussion/CeremonyDetailsDialog.vue';
import CeremonyFormDialog from 'src/dialogs/iteration/CeremonyFormDialog.vue';
import ConfirmToDeleteDiscussionDialog from 'src/dialogs/discussion/ConfirmToDeleteDiscussionDialog.vue';
import ConfirmToDeleteIterationDialog from 'src/dialogs/iteration/ConfirmToDeleteIterationDialog.vue';
import { entityKey } from 'src/entities/base.entity';
import { Project } from 'src/workflows/project/definition';
import { useQuasar } from 'quasar';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { TheDialogs } from 'src/dialogs/the-dialogs';

type WorkflowStructs = Iteration | Discussion | Project;

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const profileStore = useProfilesStore();
const projectStore = useProjectStore();
const discussionStore = useDiscussionStore();

onMounted(async () => {
  await profileStore.init();
  await projectStore.init();
  evalDrawers();
});
onUpdated(() => {
  evalDrawers();
});
const $route = useRoute();
const $router = useRouter();
const $q = useQuasar();
function evalDrawers() {
  rightDrawerOpen.value = !!($route.meta && $route.meta.actions);
  leftDrawerOpen.value = !!($route.meta && $route.meta.menus);
}
if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', async (e) => {
    if (!e.data) return;
    const log = e.data as ILoggable;
    const type = log.type as WorkflowStructs['type'];
    if (log.kind == 'operation') {
      const operation = {
        type: type,
        arg: log.data,
      } as WorkflowStructs;
      switch (operation.type) {
        case 'moveIssue':
        case 'assignTask':
        case 'createDiscussion':
        case 'voteForComplexity':
        case 'confirmAgreement':
        case 'updateDiscussionFields':
          {
            const iterationKey =
              operation.arg.item.iteration &&
              entityKey(operation.arg.item.iteration);
            await $router.replace({
              name: 'convo',
              params: {
                project: entityKey(log.project),
                iteration: iterationKey,
                ceremony:
                  operation.arg.item.ceremonyKey || iterationKey + 'plan',
                item: entityKey(operation.arg.item),
              },
            });
            TheDialogs.emit({
              type: 'viewTask',
              arg: operation.arg.item,
            });
          }
          break;
        case 'mergeFeedbackWith': {
          {
            const iterationKey =
              (operation.arg.item as ICeremony).iterationKey ??
              entityKey((operation.arg.item as DiscussionItem).iteration || '');
            const itemKey =
              (operation.arg.item as ICeremony).key ??
              entityKey((operation.arg.item as DiscussionItem).key || '');
            const ceremonyKey =
              (operation.arg.item as ICeremony).key ??
              ((operation.arg.item as DiscussionItem).ceremonyKey || '');
            $router.replace({
              name: 'convo',
              params: {
                project: entityKey(log.project),
                iteration: iterationKey,
                ceremony: ceremonyKey || iterationKey + 'plan',
                item: ceremonyKey == itemKey ? undefined : itemKey,
              },
            });
          }
          break;
        }
        case 'updateProject':
        case 'updateProjectSettings':
        case 'createProject':
          {
            $router.replace({
              name: 'settings',
              params: {
                project: entityKey(log.project),
              },
            });
          }
          break;
        case 'retroFeedback':
        case 'sendMessage':
          {
            const item = discussionStore.discussions.find(
              (d) => d.key == operation.arg.discussion
            );
            $router.replace({
              name: 'convo',
              params: {
                project: entityKey(log.project),
                iteration: operation.arg.iteration,
                ceremony: item?.ceremonyKey || operation.arg.iteration + 'plan',
                item: operation.arg.discussion,
              },
            });
          }
          break;
        case 'voteForConfidence':
        case 'resetConfidenceVoting':
          $router.replace({
            name: 'convo',
            params: {
              project: entityKey(log.project),
              iteration: operation.arg.ceremony.iterationKey,
              ceremony: operation.arg.ceremony.key,
            },
          });
          break;
        default:
          $q.notify({
            caption: type,
            message: entityKey(log.project),
          });
          break;
      }
    }
  });
}
</script>
