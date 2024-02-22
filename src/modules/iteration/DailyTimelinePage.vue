<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-timeline layout="loose" :side="'left'">
      <q-timeline-entry
        :color="
          date.getDateDiff(new Date(), c.end) > 0
            ? (c.progress || 0) < 1
              ? 'negative'
              : 'dark'
            : 'info'
        "
        v-for="c in ceremonyStore.ceremonies.filter(
          (c) =>
            iterationStore.activeIteration &&
            iterationStore.activeIteration.key == c.iterationKey
        )"
        :key="c.key"
        :title="
          (isCurrentlyHappening(c) ? '(NOW) ' : '') + c.type.toUpperCase()
        "
        :subtitle="`${date.formatDate(
          c.start,
          'ddd, MMM DD, YYYY hh:mm A'
        )} - ${date.formatDate(c.end, 'hh:mm A')}`"
        :side="/(planning|retro|review)/.test(c.type) ? 'left' : 'right'"
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
            size="30px"
            :thickness="0.15"
            color="grey"
            track-color="transparent"
            @click="
              $router.replace({
                name: 'convo',
                params: {
                  project: activeProject,
                  iteration: iterationStore.activeIteration?.key,
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
              project: c.projectKey,
              iteration: c.iterationKey,
              ceremony: c.key,
            },
          }"
          >Open</q-btn
        >
        <q-btn
          icon="edit"
          dense
          round
          align="right"
          :to="
            '/' + c.projectKey + '/' + c.iterationKey + '/' + c.key + '/edit'
          "
        />

        <q-linear-progress
          class="q-mt-sm"
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
  </q-page>
</template>

<script lang="ts">
import { date } from 'quasar';
import { DiscussionItem, ICeremony } from 'src/entities';
import { useCeremonyStore } from 'src/stores/ceremonies.store';
import { useDiscussionStore } from 'src/stores/discussions.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { defineComponent } from 'vue';
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();
const iterationStore = useIterationStore();

export default defineComponent({
  name: 'DailyTimelinePage',
  components: {},
  data() {
    return {
      date,
      activeProject: '',
      discussions: [] as DiscussionItem[],
    };
  },
  setup() {
    return {
      iterationStore,
      discussionStore,
      ceremonyStore,
    };
  },
  methods: {
    discussionFromList(list: string[]) {
      return list
        .map((key) => this.discussions.find((d) => d.key == key))
        .filter((d) => d) as DiscussionItem[];
    },
    isCurrentlyHappening(ceremony: ICeremony) {
      return date.isBetweenDates(new Date(), ceremony.start, ceremony.end);
    },
  },
});
</script>
<style></style>
