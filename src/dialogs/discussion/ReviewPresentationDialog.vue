<template>
  <q-dialog v-model="showPresentation" position="standard">
    <q-card class="fixed-center" style="width: 90%">
      <q-carousel
        v-model="slide"
        v-model:fullscreen="fullscreen"
        transition-prev="scale"
        transition-next="scale"
        swipeable
        animated
        control-color="white"
        navigation
        navigation-active-icon="slideshow"
        padding
        arrows
        class="bg-dark text-white shadow-1 rounded-borders"
      >
        <q-carousel-slide
          name="sprint"
          v-if="iteration && activeStore.activeProject"
          class="column no-wrap flex-center"
        >
          <q-img
            height="200px"
            fit="contain"
            v-if="activeStore.activeProject.icon"
            :src="activeStore.activeProject.icon"
          />
          <q-img
            v-else
            src="img:icons/For-Presentation-150x150.png"
            style="border: 5px solid gray; border-radius: 50px"
          />
          <div class="q-mt-md text-h2 text-center text-bold">
            {{ activeStore.activeProject.name }}
          </div>
          <div class="q-mt-md text-h6 text-center text-capitalize">
            {{ iteration.name }} {{ review?.type }}
          </div>
          <div class="q-mt-md text-center" v-if="review">
            <q-icon name="time" />
            {{ date.formatDate(review.start, 'MMM DD') }}
          </div>
        </q-carousel-slide>
        <q-carousel-slide
          name="goals"
          v-if="goals.length"
          class="column no-wrap flex-center"
        >
          <q-icon name="flag_circle" size="56px" />
          <div class="q-mt-md text-center text-bold text-h6">Goals</div>
          <div class="q-mt-md full-width">
            <q-banner
              rounded
              class="q-my-xs text-center text-h6 full-width"
              :class="item.doneDate ? 'bg-positive' : 'bg-negative'"
              v-for="item in goals"
              :key="item.key"
            >
              <q-icon name="ads_click" class="self-center" />
              {{ item.description }}

              <recent-active-members
                :profiles="membersAgreed(item)"
                sizes="sm"
              />

              <template #action>
                <q-icon
                  v-if="!item.doneDate"
                  name="sentiment_very_dissatisfied"
                  size="xl"
                >
                  <q-tooltip>Not Done</q-tooltip>
                </q-icon>
                <q-icon v-else name="check" size="xl">
                  <q-tooltip
                    >Done on
                    {{ date.formatDate(item.doneDate, 'MMM DD') }}</q-tooltip
                  >
                </q-icon>
              </template>
            </q-banner>
          </div>
        </q-carousel-slide>
        <q-carousel-slide
          v-for="slide in objectiveSlides"
          :key="slide.name"
          :name="slide.name"
          class="column no-wrap flex-center"
        >
          <q-icon name="flag_circle" size="56px" />
          <div class="text-center text-h6">
            <q-icon name="ads_click" class="self-center" />
            {{ slide.goal?.description }}
          </div>
          <div class="q-mt-md text-center text-bold text-h5">Objectives</div>
          <q-banner
            rounded
            class="q-my-xs text-center text-h6 bg-accent full-width"
            :class="item.doneDate ? 'bg-positive' : 'bg-negative'"
            v-for="item in slide.objectives"
            :key="item.key"
          >
            {{ item.description }}
            <div>
              <recent-active-members
                :profiles="membersAgreed(item)"
                sizes="sm"
              />
            </div>
            <template #action>
              <q-icon
                v-if="!item.doneDate"
                name="sentiment_very_dissatisfied"
                size="xl"
              >
                <q-tooltip>Not Done</q-tooltip>
              </q-icon>
              <q-icon v-else name="check" size="xl">
                <q-tooltip
                  >Done on
                  {{ date.formatDate(item.doneDate, 'MMM DD') }}</q-tooltip
                >
              </q-icon>
            </template>
          </q-banner>
        </q-carousel-slide>
        <q-carousel-slide
          v-for="slide in storiesSlides"
          :key="slide.name"
          :name="slide.name"
          class="column no-wrap flex-center"
        >
          <q-icon name="adjust" size="56px" />
          <div class="text-center text-h6">
            <q-icon name="ads_click" class="self-center" />
            {{ slide.objective?.description }}
          </div>
          <div class="q-mt-md text-center text-bold text-h5">Stories</div>
          <q-banner
            rounded
            class="q-my-xs text-center text-h6 bg-accent full-width"
            :class="item.doneDate ? 'bg-positive' : 'bg-negative'"
            v-for="item in slide.stories"
            :key="item.key"
          >
            {{ discussionStore.describeDiscussion(item) }}

            <div v-if="item.targetUser">
              <q-separator />
              {{
                `As a ${item.targetUser}, I want to ${
                  item.subject ?? ''
                }, so that ${item.purpose ?? ''}`
              }}
            </div>
            <div>
              <recent-active-members
                :profiles="membersAgreed(item)"
                sizes="sm"
              />
            </div>
            <template #action>
              <q-icon
                v-if="!item.doneDate"
                name="sentiment_very_dissatisfied"
                size="xl"
              >
                <q-tooltip>Not Done</q-tooltip>
              </q-icon>
              <q-icon v-else name="check" size="xl">
                <q-tooltip
                  >Done on
                  {{ date.formatDate(item.doneDate, 'MMM DD') }}</q-tooltip
                >
              </q-icon>
            </template>
          </q-banner>
        </q-carousel-slide>
        <q-carousel-slide name="burn-down">
          <div class="q-mt-md text-center text-bold text-h5">
            Burn Down Chart
          </div>
          <burn-down-page preview />
        </q-carousel-slide>
        <q-carousel-slide
          v-for="slide in roadblocksSlides"
          :key="slide.name"
          :name="slide.name"
          class="column no-wrap flex-center"
        >
          <q-icon name="adjust" size="56px" />
          <div class="q-mt-md text-center text-bold text-h5">Roadblocks</div>
          <q-banner
            rounded
            class="q-my-xs text-center text-h6 full-width"
            :class="item.resolution ? 'bg-positive' : 'bg-negative'"
            v-for="item in slide.roadblocks"
            :key="item.key"
          >
            {{ discussionStore.describeDiscussion(item) }}

            <div v-if="item.resolution">
              <q-separator />
              {{ item.resolution }}
            </div>
            <div>
              <recent-active-members
                :profiles="membersAgreed(item)"
                sizes="sm"
              />
            </div>
            <template #action
              ><q-btn
                icon="thumb_up_alt"
                size="sm"
                flat
                dense
                round
                @click="
                  TheDialogs.emit({
                    type: 'agreeOnItemReadiness',
                    arg: {
                      item,
                    },
                  })
                "
            /></template>
          </q-banner>
        </q-carousel-slide>
        <q-carousel-slide name="summary">
          <div class="q-mt-md text-center text-bold text-h5">Summary</div>
          <div class="row absolute-center">
            <div class="text-center">
              <div class="text-h6">Total Points</div>
              <div class="text-h4">{{ totalPoints }}</div>

              <div
                v-if="completedPoints"
                :class="completedPoints < totalPoints ? 'text-negative' : ''"
              >
                <q-separator />
                <div class="row justify-around" :style="'min-width:200px'">
                  <div class="col">
                    <div class="text-h6">Completed</div>
                    <div class="text-h4 text-bold">{{ completedPoints }}</div>
                  </div>
                  <div class="col">
                    <div class="text-h6">Missed</div>
                    <div class="text-h4 text-bold">
                      {{
                        (planning?.totalCommitted || totalPoints) -
                        completedPoints
                      }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="!review?.totalCompleted && activeStore.canUserModerate"
              >
                <q-separator />
                <q-btn
                  icon="handshake"
                  class="q-mt-xl"
                  size="xl"
                  flat
                  round
                  dense
                  @click="acceptSprintResult"
                />
              </div>
              <q-icon
                v-else
                name="verified"
                :color="completedPoints < totalPoints ? 'negative' : 'positive'"
                size="xl"
              >
                <q-tooltip
                  >Reviewed on
                  {{
                    date.formatDate(review?.dateReviewed, 'MMM DD, YYYY')
                  }}</q-tooltip
                >
              </q-icon>
            </div>
          </div>
        </q-carousel-slide>
        <template v-slot:control>
          <q-carousel-control position="bottom-right" :offset="[18, 18]">
            <q-btn
              push
              round
              dense
              color="white"
              text-color="primary"
              :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="fullscreen = !fullscreen"
            />
          </q-carousel-control>
        </template>
      </q-carousel>
    </q-card>
  </q-dialog>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
import { TheDialogs } from '../the-dialogs';
import {
  DiscussionItem,
  IGoal,
  IIteration,
  IObjective,
  IPlanningCeremony,
  IReviewCeremony,
  IRoadBlock,
  IStory,
} from 'src/entities';
import { useActiveStore } from 'src/stores/active.store';
import { date, useQuasar } from 'quasar';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { entityKey } from 'src/entities/base.entity';
import BurnDownPage from 'src/modules/iteration/BurnDownPage.vue';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
const showPresentation = ref(false);
const slide = ref('sprint');
const fullscreen = ref(false);
const iteration = ref<IIteration>();
const activeStore = useActiveStore();
const discussionStore = useDiscussionStore();
const planning = ref<IPlanningCeremony>();
const review = ref<IReviewCeremony>();
const totalPoints = ref(0);
const completedPoints = ref(0);
function membersAgreed(item: DiscussionItem) {
  const awareness = item.awareness || {};
  return activeStore.activeMembers.filter((m) => awareness[m.key] == 'agree');
}
const goals = computed(() => {
  return discussionStore.discussions.filter(
    (d) =>
      d.type == 'goal' &&
      d.projectKey == activeStore.activeProject?.key &&
      d.iteration &&
      entityKey(d.iteration) == iteration.value?.key
  ) as IGoal[];
});
const MAX_SLIDE_ITEM_COUNT = 2;
const objectiveSlides = computed(() => {
  const slides: { name: string; goal?: IGoal; objectives: IObjective[] }[] = [];
  const parts = goals.value || [{}];
  parts.forEach((goal) => {
    const list = discussionStore.discussions.filter(
      (d) =>
        d.type == 'objective' &&
        ((d.parent && entityKey(d.parent) == goal.key) ||
          d.projectKey == activeStore.activeProject?.key) &&
        d.iteration &&
        entityKey(d.iteration) == iteration.value?.key
    ) as IObjective[];
    while (list.length > 0) {
      slides.push({
        name: 'objective-' + (slides.length + 1),
        goal,
        objectives: list.splice(0, MAX_SLIDE_ITEM_COUNT),
      });
    }
  });
  return slides;
});
const storiesSlides = computed(() => {
  const slides: {
    name: string;
    goal?: IGoal;
    objective?: IObjective;
    stories: IStory[];
  }[] = [];
  const parts = objectiveSlides.value;
  (parts.length ? parts : ([{}] as (typeof parts)[0][])).forEach((slide) => {
    (slide.objectives || [{}]).forEach((obj) => {
      const list = discussionStore.discussions.filter(
        (d) =>
          d.type == 'story' &&
          ((d.parent && entityKey(d.parent) == obj.key) ||
            d.projectKey == activeStore.activeProject?.key) &&
          d.iteration &&
          entityKey(d.iteration) == iteration.value?.key
      ) as IStory[];
      while (list.length > 0) {
        slides.push({
          name: 'story-' + (slides.length + 1),
          goal: slide.goal,
          objective: obj,
          stories: list.splice(0, MAX_SLIDE_ITEM_COUNT),
        });
      }
    });
  });
  return slides;
});
const roadblocksSlides = computed(() => {
  const slides: {
    name: string;
    roadblocks: IRoadBlock[];
  }[] = [];
  const parts = discussionStore.discussions.filter(
    (d) =>
      d.type == 'roadblock' &&
      d.projectKey == activeStore.activeProject?.key &&
      d.iteration &&
      entityKey(d.iteration) == iteration.value?.key
  ) as IRoadBlock[];
  while (parts.length > 0) {
    slides.push({
      name: 'roadblocks-' + (slides.length + 1),
      roadblocks: parts.splice(0, MAX_SLIDE_ITEM_COUNT),
    });
  }
  return slides;
});
TheDialogs.on({
  type: 'playReviewPresentation',
  cb(e) {
    if (!e.iteration) return;
    const sprint = e.iteration;
    const ceremonyStore = useCeremonyStore();
    iteration.value = e.iteration;
    planning.value = ceremonyStore.ceremonies.find(
      (c) => c.type == 'planning' && c.iterationKey == iteration.value?.key
    ) as IPlanningCeremony;
    review.value = ceremonyStore.ceremonies.find(
      (c) => c.type == 'review' && c.iterationKey == iteration.value?.key
    ) as IReviewCeremony;
    if (
      review.value.totalCompleted &&
      typeof review.value.targetMissed == 'number'
    ) {
      completedPoints.value = review.value.totalCompleted;
      totalPoints.value =
        planning.value.totalCommitted ||
        review.value.targetMissed + completedPoints.value;
    } else {
      const planned = discussionStore.discussions.filter(
        (d) => d.iteration && entityKey(d.iteration) == e.iteration?.key
      );
      totalPoints.value =
        planning.value.totalCommitted ||
        planned.reduce((prev, curr) => {
          return prev + Number(curr.complexity || 0);
        }, 0);
      completedPoints.value = planned
        .filter(
          (d) =>
            d.doneDate &&
            date.getDateDiff(d.doneDate, sprint.start, 'days') >= 0 &&
            date.getDateDiff(sprint.end, d.doneDate, 'days') >= 0
        )
        .reduce((prev, curr) => {
          return prev + Number(curr.complexity || 0);
        }, 0);
    }
    slide.value = 'sprint';
    showPresentation.value = true;
  },
});
const $q = useQuasar();
function acceptSprintResult() {
  if (!review.value) return;
  const completed = completedPoints.value;
  const committed = planning.value?.totalCommitted || totalPoints.value;
  const missed = committed - completedPoints.value;
  $q.notify({
    message: 'Should we proceed to accept the result?',
    caption: `Completed: ${completed}, Missed: ${missed}`,
    position: 'center',
    timeout: 0,
    group: false,
    color: 'primary',
    actions: [
      {
        label: 'Accept',
        color: 'white',
        handler: async () => {
          if (!review.value) return;
          review.value = await TheWorkflows.emitPromised<IReviewCeremony>({
            type: 'acceptSprintResult',
            arg: {
              review: { ...review.value },
              completed: completed,
              missed: missed,
            },
          });
        },
      },
      {
        icon: 'cancel',
        color: 'white',
        handler: () => {
          /* ... */
        },
      },
    ],
  });
}
</script>
