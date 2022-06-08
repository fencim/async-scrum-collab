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
          :to="{
            name: 'iterationform',
            params: {
              project,
              iteration: iteration.key,
            },
          }"
        />
      </div>
    </q-timeline-entry>
    <q-timeline-entry
      v-for="c in ceremonies"
      :key="c.key"
      :title="c.type.toUpperCase()"
      :subtitle="`${date.formatDate(
        c.start,
        'MMM DD, YYYY hh:mm A'
      )} - ${date.formatDate(c.end, 'hh:mm A')} (${date.getDateDiff(
        c.end,
        c.start,
        'hours'
      )} hours)`"
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
          {{ i?.projectKey }}{{ (i.key.match(/\d+$/) || [])[0] }}
          <q-badge v-if="i?.unread" floating>{{ i?.unread }}</q-badge>
          <q-tooltip
            ><div class="text-caption">
              {{ discussionStore.describeDiscussion(i) }}
            </div>
            <q-linear-progress :value="i.progress" />
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

<script lang="ts">
import { date } from 'quasar';
import { DiscussionItem, ICeremony, IIteration } from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies';
import { useDiscussionStore } from 'src/stores/discussions';
import { useProjectStore } from 'src/stores/projects';
import { defineComponent } from 'vue';
const projectStore = useProjectStore();
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();

export default defineComponent({
  name: 'IterationTimeline',
  components: {},
  props: {
    project: {
      type: String,
      required: true,
    },
    iteration: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      date,
      projectStore,
      ceremonyStore,
      discussionStore,
      discussions: [] as DiscussionItem[],
      ceremonies: [] as ICeremony[],
    };
  },
  async mounted() {
    this.ceremonies = (
      await ceremonyStore.ofIteration(this.project, this.iteration.key)
    )
      .filter((c) => c.type != 'scrum')
      .sort((a, b) => {
        return date.getDateDiff(a.start, b.start, 'hours');
      });
    this.discussions = await discussionStore.ofProject(this.project);
  },
  methods: {
    isCurrent(iteration: object) {
      const sprint = iteration as IIteration;
      return date.isBetweenDates(new Date(), sprint.start, sprint.end);
    },
    discussionFromList(list: string[]) {
      return list
        .map((key) => this.discussions.find((d) => d.key == key))
        .filter((d) => d) as DiscussionItem[];
    },
  },
});
</script>
<style></style>
