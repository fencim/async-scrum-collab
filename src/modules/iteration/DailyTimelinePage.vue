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
        v-for="c in ceremonies"
        :key="c.key"
        :title="c.type.toUpperCase()"
        :subtitle="`${date.formatDate(
          c.start,
          'ddd, MMM DD, YYYY hh:mm A'
        )} - ${date.formatDate(c.end, 'hh:mm A')}`"
        :side="/(planning|retro|review)/.test(c.type) ? 'left' : 'right'"
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
                  iteration: activeIteration,
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
          :color="
            (c.progress || 0) < 1 && date.getDateDiff(new Date(), c.end) > 0
              ? 'red'
              : 'blue'
          "
          instant-feedback
          :value="c.progress"
        />
      </q-timeline-entry>
      <!-- <q-timeline-entry
        title="Sprint Planning"
        subtitle="February 22, 1986"
        side="left"
      >
        <div>Total Points : 86pts</div>
        <div>
          <q-btn
            dense
            :to="
              '/' +
              (activeProject || 'AP') +
              '/' +
              (activeIteration || 'AI') +
              '/planning'
            "
            >Open</q-btn
          >
        </div>
      </q-timeline-entry>

      <q-timeline-entry
        title="Daily Scrum"
        subtitle="February 21, 1986"
        side="right"
        icon="calendar_today"
      >
        <div>
          <div>Burned Stories: 12pts</div>
          <div>Bug Fixed: 6 defecs</div>
          <div>New Bugs: 1 defecs</div>
          <div>Roadbloacks</div>
          <ul>
            <li>Slow Internet Connection</li>
            <li>Unstable Build</li>
          </ul>
        </div>
      </q-timeline-entry>

      <q-timeline-entry
        title="Non-working day"
        subtitle="February 22, 1986"
        side="left"
        avatar="https://cdn.quasar.dev/img/avatar3.jpg"
      >
        <div>Holiday</div>
      </q-timeline-entry>

      <q-timeline-entry
        title="Daily Scrum"
        subtitle="February 22, 1986"
        side="right"
      >
        <div>
          <div>Burned Stories: 12pts</div>
          <div>Bug Fixed: 6 defecs</div>
          <div>New Bugs: 1 defecs</div>
          <div class="text-bold">ROADBLOCKS:</div>
          <ul>
            <li>
              <q-avatar size="xs"><img src="icons/avatar3.jpg" /> </q-avatar>
              Slow Internet Connection
            </li>
            <li>
              <q-avatar size="xs"><img src="icons/avatar2.jpg" /> </q-avatar>
              Unstable Build
            </li>
          </ul>
        </div>
      </q-timeline-entry>

      <q-timeline-entry
        title="Daily Scrum"
        subtitle="February 22, 1986"
        side="right"
        color="orange"
        icon="calendar_today"
      >
        <div>
          <div>Burned Stories: 12pts</div>
          <div>Bug Fixed: 6 defecs</div>
          <div>New Bugs: 1 defecs</div>
          <div class="text-bold">ROADBLOCKS:</div>
          <ul>
            <li>Slow Internet Connection</li>
            <li>Unstable Build</li>
          </ul>
        </div>
      </q-timeline-entry>

      <q-timeline-entry
        title="Backlog Grooming"
        subtitle="February 22, 1986"
        side="right"
      >
        <div>Stories, Accepance Criterias, Complexity</div>
      </q-timeline-entry>

      <q-timeline-entry
        title="Sprint Review"
        subtitle="February 22, 1986"
        side="left"
      >
        <div>
          <div>Completed: 89pts</div>
          <div>Missed: 8pts</div>

          Demo link: <a href="www.youtube.com">YouTube</a>
        </div>
      </q-timeline-entry> -->
    </q-timeline>
  </q-page>
</template>

<script lang="ts">
import { date } from 'quasar';
import { DiscussionItem, ICeremony } from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies';
import { useDiscussionStore } from 'src/stores/discussions';
import { defineComponent } from 'vue';
const ceremonyStore = useCeremonyStore();
const discussionStore = useDiscussionStore();

export default defineComponent({
  name: 'IndexPage',
  components: {},
  data() {
    return {
      date,
      discussionStore,
      activeProject: '',
      activeIteration: '',
      ceremonies: [] as ICeremony[],
      discussions: [] as DiscussionItem[],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.activeProject =
        (this.$route.params.project && String(this.$route.params.project)) ||
        '';
      this.activeIteration =
        (this.$route.params.iteration &&
          String(this.$route.params.iteration)) ||
        '';
      this.ceremonies = (
        await ceremonyStore.ofIteration(
          this.activeProject,
          this.activeIteration
        )
      ).sort((a, b) => {
        return date.getDateDiff(a.start, b.start, 'hours');
      });
      this.discussions = await discussionStore.ofProject(this.activeProject);
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
