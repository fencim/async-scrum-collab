<template>
  <q-timeline color="secondary">
    <q-timeline-entry
      heading
      class="q-pa-sm q-ma-sm rounded-borders"
      :class="isCurrent(iteration) ? 'bg-grey-8' : 'bg-grey-10'"
    >
      {{ iteration.name }}
      <q-btn
        :to="{
          name: 'iteration',
          params: {
            project,
            iteration: iteration.key,
          },
        }"
        >Open</q-btn
      >
      <q-icon
        v-if="isCurrent(iteration)"
        name="play_arrow"
        class="float-right"
        size="sm"
        style="border: 2px solid white; border-radius: 100%"
      />
      <div class="full-width text-overline">
        {{ date.formatDate(iteration?.start, 'MMM DD, YYYY') }} -
        {{ date.formatDate(iteration?.end, 'MMM DD, YYYY') }} ({{
          date.getDateDiff(iteration?.end, iteration?.start, 'days')
        }}
        days)
        <q-btn
          round
          dense
          icon="edit"
          class="float-right"
          @click="
            TheDialogs.emit({
              type: 'editIteration',
              arg: {
                iteration,
              },
            })
          "
        />
      </div>
    </q-timeline-entry>
    <q-timeline-entry
      v-for="c in ceremonies"
      :key="c.key"
      :title="(isCurrentlyHappening(c) ? '(NOW) ' : '') + c.type.toUpperCase()"
      :subtitle="`${date.formatDate(
        c.start,
        'MMM DD, YYYY hh:mm A'
      )} - ${date.formatDate(c.end, 'hh:mm A')} (${date.getDateDiff(
        c.end,
        c.start,
        'hours'
      )} hours)`"
      :class="isCurrentlyHappening(c) ? 'bg-teal-7 rounded-borders' : ''"
    >
      <div>
        <q-circular-progress
          v-for="i in discussionFromList(c.discussions)"
          :key="i?.key"
          :value="(i?.progress || 0) * 100"
          show-value
          font-size="12px"
          class="text-white q-ma-sm text-uppercase cursor-pointer"
          size="40px"
          :thickness="0.15"
          color="grey"
          track-color="transparent"
          @click="
            $router.replace({
              name: 'convo',
              params: {
                project,
                iteration: iteration.key,
                ceremony: c.key,
                item: i.key,
              },
            })
          "
        >
          {{ formatKey(i.key) }}
          <q-badge v-if="i?.unread" floating>{{ i?.unread }}</q-badge>
          <q-tooltip class="q-pa-none q-ma-none">
            <q-card
              style="min-width: 250px"
              class="list-group-item q-ma-none q-pa-none board-card no-shadow"
              :class="i.type + '-card'"
            >
              <component
                :is="getComponent(i as PlanningItem)"
                :task="i"
                :no-action="true"
              />
            </q-card>
          </q-tooltip>
        </q-circular-progress>
      </div>
      <q-btn
        :to="{
          name: 'ceremony',
          params: {
            project,
            iteration: c.iterationKey,
            ceremony: c.key,
          },
        }"
        >Open</q-btn
      >
      <q-linear-progress
        :color="
          (c.progress || 0) < 1 && date.getDateDiff(new Date(), c.end) > 0
            ? 'red'
            : 'blue'
        "
        instant-feedback
        :value="c.progress"
      />
    </q-timeline-entry>
  </q-timeline>
</template>

<script lang="ts" setup>
import { date } from 'quasar';
import { formatKey } from 'src/components/discussion.helper';
import {
  DiscussionItem,
  IIteration,
  ICeremony,
  PlanningItem,
} from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { computed, PropType } from 'vue';
import { getComponent } from '../task-board/card-components';
import { TheDialogs } from 'src/dialogs/the-dialogs';

const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const props = defineProps({
  project: {
    type: String,
    required: true,
  },
  iteration: {
    type: Object as PropType<IIteration>,
    required: true,
  },
});
const ceremonies = computed(() => {
  return ceremonyStore.ceremonies.filter(
    (c) => c.iterationKey == props.iteration.key && c.type != 'scrum'
  );
});
const discussions = computed(() => {
  return discussionStore.discussions;
});

function isCurrent(iteration: object) {
  const sprint = iteration as IIteration;
  return date.isBetweenDates(new Date(), sprint.start, sprint.end);
}
function isCurrentlyHappening(ceremony: ICeremony) {
  return date.isBetweenDates(new Date(), ceremony.start, ceremony.end);
}
function discussionFromList(list: string[]) {
  return list
    .map((key) => discussions.value.find((d) => d.key == key))
    .filter((d) => d) as DiscussionItem[];
}
</script>
<style></style>
