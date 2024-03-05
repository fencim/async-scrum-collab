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
            {{ iteration.name }} {{ planning?.type || '' }}
          </div>
          <div class="q-mt-md text-center">
            <q-icon name="today" />
            {{ date.formatDate(iteration.start, 'MMM DD') }} to
            {{ date.formatDate(iteration.end, 'MMM DD') }}
          </div>
        </q-carousel-slide>
        <q-carousel-slide name="members" class="column no-wrap flex-center">
          <q-icon name="diversity_3" size="50px" />
          <div class="q-mt-md text-center text-bold text-h6">
            {{ activeStore.activeProject?.name }} Moderators
          </div>
          <div class="q-mt-md text-center">
            <recent-active-members
              :profiles="moderators"
              :max-count="4"
              sizes="lg"
            />
          </div>
          <div class="q-mt-md text-center text-bold text-h6">
            {{ activeStore.activeProject?.name }} Team
          </div>
          <div class="q-mt-md text-center">
            <recent-active-members
              :profiles="members"
              :max-count="15"
              sizes="lg"
            />
          </div>
          <div class="q-mt-md text-center">
            <q-separator />
            <div class="text-h6">Team Velocity</div>
            <div>
              <span v-if="previousReviews.length > 1"
                >({{
                  previousReviews.map((r) => r.totalCompleted || 0).join(',')
                }})</span
              >
              <span class="text-h4">
                {{ teamVelocity }}
              </span>
            </div>
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
              class="q-my-xs text-center text-h6 bg-accent full-width"
              v-for="item in goals"
              :key="item.key"
            >
              <q-icon name="ads_click" class="self-center" />
              {{ item.description }}

              <recent-active-members
                :profiles="membersAgreed(item)"
                sizes="sm"
              />

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
            :class="item.resolution ? 'bg-accent' : 'bg-negative'"
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

              <div v-if="planning?.confidence">
                <q-separator />
                <div class="text-h6">Team Confidence Vote</div>
                <div class="text-h4">{{ planning?.confidence }}</div>
              </div>
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
import { date } from 'quasar';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { entityKey } from 'src/entities/base.entity';
import BurnDownPage from 'src/modules/iteration/BurnDownPage.vue';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useConvoStore } from 'src/stores/convo.store';
const showPresentation = ref(false);
const slide = ref('sprint');
const fullscreen = ref(false);
const iteration = ref<IIteration>();
const activeStore = useActiveStore();
const discussionStore = useDiscussionStore();
const convoStore = useConvoStore();
const planning = ref<IPlanningCeremony>();
const totalPoints = ref(0);
const teamVelocity = ref(0);
const completedPoints = ref(0);
function membersAgreed(item: DiscussionItem) {
  if (!iteration.value) return [];
  const convo = convoStore.convo[entityKey(iteration.value)] || [];
  const reaction = convo.filter(
    (c) =>
      c.discussion == item.key && c.type == 'reaction' && c.reaction == 'agree'
  );
  const agreed = [...new Set(reaction.map((m) => entityKey(m.from)))];
  return activeStore.activeMembers.filter((m) => agreed.includes(m.key));
}
const members = computed(() => {
  return [...activeStore.activeMembers];
});
const moderators = computed(() => {
  return [...activeStore.administrators, ...activeStore.moderators];
});
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
const previousReviews = ref<IReviewCeremony[]>([]);
TheDialogs.on({
  type: 'playPlanningPresentation',
  cb(e) {
    if (!e.iteration) return;
    const sprint = e.iteration;
    const ceremonyStore = useCeremonyStore();
    iteration.value = e.iteration;
    planning.value = ceremonyStore.ceremonies.find(
      (c) => c.type == 'planning' && c.iterationKey == iteration.value?.key
    ) as IPlanningCeremony;
    previousReviews.value = ceremonyStore.ceremonies
      .filter(
        (c) =>
          c.type == 'review' &&
          c.projectKey == sprint.projectKey &&
          date.getDateDiff(sprint.start, c.start, 'days') > 0
      )
      .sort((a, b) => b.start.localeCompare(a.start))
      .splice(0, 3) as IReviewCeremony[];
    //max last  sprints
    teamVelocity.value = previousReviews.value.reduce(
      (total, r) => total + (r.totalCompleted || 0),
      0
    );
    if (previousReviews.value.length) {
      teamVelocity.value = teamVelocity.value / previousReviews.value.length;
    }
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
    slide.value = 'sprint';
    showPresentation.value = true;
  },
});
</script>
