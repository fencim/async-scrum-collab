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
import {
  CeremonyType,
  CeremonyTypes,
  DiscussionItem,
  ICeremony,
  ILoggable,
} from 'src/entities';
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
import { useNotificationStore } from 'src/stores/notification.store';
import { convoBus } from 'src/modules/ceremony/convo-bus';

type WorkflowStructs = Iteration | Discussion | Project;

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const profileStore = useProfilesStore();
const projectStore = useProjectStore();
const discussionStore = useDiscussionStore();
profileStore.init();
projectStore.init();

onMounted(async () => {
  evalDrawers();
});
onUpdated(() => {
  evalDrawers();
});
const $route = useRoute();
const $router = useRouter();
const $q = useQuasar();
const notificationStore = useNotificationStore();
function evalDrawers() {
  rightDrawerOpen.value = !!($route.meta && $route.meta.actions);
  leftDrawerOpen.value = !!($route.meta && $route.meta.menus);
}
if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', async (e) => {
    if (!e.data) return;
    const event = e.data as
      | {
          type: 'notificationClick';
          data: ILoggable;
        }
      | {
          type: 'newNotification';
          body: string;
          title: string;
          icon: string;
          tag: string;
          data: ILoggable;
        };
    const log = event.data;
    if (event.type == 'newNotification') {
      notificationStore.newNotification({
        body: event.body,
        title: event.title,
        tag: event.tag,
        badge: event.icon,
        log: event.data,
      });
      return;
    }
    routeNotification(log);
  });
}
convoBus.on('routeNotification', ((log: ILoggable) => {
  routeNotification(log);
}) as VoidFunction);

async function routeNotification(log: ILoggable) {
  profileStore.setLastReadNotification(log);
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
              ceremony: operation.arg.item.ceremonyKey || iterationKey + 'plan',
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
      case 'resolveQuestionOf':
      case 'mergeFeedbackWith':
      case 'askQuestion':
      case 'replyToMessage': {
        const ceremony = CeremonyTypes.includes(
          operation.arg.item.type as CeremonyType
        )
          ? (operation.arg.item as ICeremony)
          : undefined;
        const item =
          typeof ceremony == 'undefined'
            ? (operation.arg.item as DiscussionItem)
            : undefined;
        if (ceremony) {
          $router.replace({
            name: 'convo',
            params: {
              project: entityKey(log.project),
              iteration: ceremony.iterationKey,
              ceremony: ceremony.key,
            },
          });
        } else if (item) {
          $router.replace({
            name: 'convo',
            params: {
              project: entityKey(log.project),
              iteration: item.iteration && entityKey(item.iteration),
              ceremony: item.ceremonyKey,
              item: item.key,
            },
          });
        }
        break;
      }
      default:
        $q.notify({
          caption: type,
          message: entityKey(log.project),
        });
        break;
    }
  }
}
</script>
