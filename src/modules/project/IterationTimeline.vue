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
    </q-timeline-entry>
  </q-timeline>
</template>

<script lang="ts">
import { date } from 'quasar';
import { ICeremony, IIteration } from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies';
import { useProjectStore } from 'src/stores/projects';
import { defineComponent } from 'vue';
const projectStore = useProjectStore();
const ceremonyStore = useCeremonyStore();

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
  },
  methods: {
    isCurrent(iteration: object) {
      const sprint = iteration as IIteration;
      return date.isBetweenDates(new Date(), sprint.start, sprint.end);
    },
  },
});
</script>
<style></style>
