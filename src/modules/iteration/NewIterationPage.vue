<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-form @submit="submitNewIteration">
      <q-card>
        <q-toolbar>
          <q-avatar>
            <img src="icons/favicon-128x128.png" />
          </q-avatar>

          <q-toolbar-title
            ><span class="text-weight-bold">{{
              $route.params.iteration ? 'Edit' : 'New'
            }}</span>
            Iteration</q-toolbar-title
          >

          <q-btn flat round dense icon="close" :to="`/${activeProjectKey}/`" />
        </q-toolbar>

        <q-card-section class="row">
          <q-input
            v-model="theIteration.name"
            label="Name"
            class="col-12"
            :rules="[
              (v) => (v && v.length > 0) || 'Enter Iteration Name',
              (v) =>
                (v &&
                  !iterations.find(
                    (i) => i.name.toLowerCase() == v.toLowerCase()
                  )) ||
                v + ' iteration name is not available',
            ]"
          />
          <q-date
            class="full-width"
            v-model="range"
            range
            @update:model-value="planSched = ceremonies"
          />
          <q-toggle
            v-model="scheduleCeremonies"
            label="Schedule Iteration Ceremonies"
          />
        </q-card-section>
        <q-card-section v-if="scheduleCeremonies">
          <q-list class="full-width">
            <q-item clickable dense v-for="d in planSched" :key="d.key">
              <q-item-section>
                <q-item-label class="text-bold">{{ d.desc }}</q-item-label>
                <q-item-label caption>
                  {{ date.formatDate(d.start, 'MMM DD, YYYY hh:mm A') }} -
                  {{ date.formatDate(d.end, 'hh:mm A') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="d.check" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions :align="'right'">
          <q-btn icon="save" :loading="saving" type="submit">Save</q-btn>
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { date } from 'quasar';
import { IIteration, IProject, CeremonyType } from 'src/entities';
import { useCeremonyStore } from 'src/stores/cermonies.store';
import { useIterationStore } from 'src/stores/iterations.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
const projectStore = useProjectStore();
const iterationStore = useIterationStore();
const ceremonyStore = useCeremonyStore();
type Schedule = {
  key: string;
  desc: string;
  start: Date;
  end: Date;
  check: boolean;
  type: CeremonyType;
};
export default defineComponent({
  name: 'IterationPage',
  components: {},
  data() {
    return {
      date: date,
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
      iterationStore,
      activeProjectKey: 'AA1',
      activeProject: undefined as IProject | undefined,
      theIteration: {} as IIteration,
      icon: undefined as File | undefined,
      iterations: [] as IIteration[],
      scheduleCeremonies: true,
      saving: false,
      planSched: [] as Schedule[],
      range: {
        from: '',
        to: '',
      },
    };
  },
  async mounted() {
    this.activeProjectKey =
      (this.$route.params.project && String(this.$route.params.project)) || '';
    this.activeProject = projectStore.activeProject;
    const editing = this.$route.params.iteration as string;
    if (!editing) {
      this.iterations = await iterationStore.ofProject(this.activeProjectKey);
      const lastIteration = this.iterations[this.iterations.length - 1];
      const dateNow = lastIteration
        ? new Date(date.formatDate(lastIteration.end))
        : new Date();
      if (dateNow.getDay() != 1) {
        dateNow.setDate(dateNow.getDate() + (8 - dateNow.getDay()));
      }
      this.theIteration.projectKey = this.activeProjectKey;
      this.theIteration.key =
        this.activeProjectKey + 'S' + String(this.iterations.length);
      this.theIteration.start = date.formatDate(dateNow, 'YYYY/MM/DD');
      dateNow.setDate(dateNow.getDate() + 11);
      this.theIteration.end = date.formatDate(dateNow, 'YYYY/MM/DD');
    } else {
      this.theIteration =
        (await iterationStore.withKey(this.activeProjectKey, editing)) ||
        this.theIteration;
    }
    this.range = {
      from: this.theIteration.start,
      to: this.theIteration.end,
    };
    this.planSched = this.ceremonies;
  },
  computed: {
    ceremonies(): Schedule[] {
      const schedules: Schedule[] = [];
      const start = new Date(this.range?.from);
      const end = new Date(this.range?.to);
      const [plan, review, retro]: Schedule[] = [
        {
          key: this.theIteration.key + 'plan',
          check: true,
          type: 'planning',
          start: new Date(start),
          end: new Date(start),
          desc: 'Planning',
        },
        {
          key: this.theIteration.key + 'reivew',
          check: true,
          start: new Date(end),
          end: new Date(end),
          desc: 'Reivew',
          type: 'review',
        },
        {
          key: this.theIteration.key + 'retro',
          check: true,
          start: new Date(end),
          end: new Date(end),
          desc: 'Retrospective',
          type: 'retro',
        },
      ];
      plan.end.setHours(20);
      review.end.setHours(12);
      retro.start.setHours(12);
      retro.end.setHours(23, 59);
      schedules.push(plan, review, retro);
      end.setDate(end.getDate() - 1);
      const cursor = new Date(start);
      let dayCounter = 0;
      while (cursor < end) {
        cursor.setDate(cursor.getDate() + 1);
        if (cursor.getDay() <= 5 && cursor.getDay() > 0) {
          dayCounter++;
          const sched: Schedule = {
            key: this.theIteration.key + 'DS' + dayCounter,
            check: true,
            start: new Date(cursor),
            end: new Date(cursor),
            desc: `Daily Scrum (${dayCounter}) ${
              this.weekdays[cursor.getDay()]
            }`,
            type: 'scrum',
          };
          sched.end.setHours(20);
          schedules.push(sched);
        }
      }
      return schedules;
    },
  },
  methods: {
    async submitNewIteration() {
      this.saving = false;
      this.theIteration.start = this.range.from;
      this.theIteration.end = this.range.to;
      this.theIteration.key =
        this.activeProjectKey + 'S' + this.iterations.length;
      await iterationStore.saveIteration(this.theIteration);
      if (this.scheduleCeremonies) {
        for (let index = 0; index < this.planSched.length; index++) {
          const sched = this.planSched[index];
          if (!sched.check) continue;
          await ceremonyStore.saveCeremony({
            key: sched.key,
            projectKey: this.theIteration.projectKey,
            discussions: [],
            start: date.formatDate(sched.start),
            end: date.formatDate(sched.end),
            type: sched.type,
            iterationKey: this.theIteration.key,
          });
        }
      }
      this.$router.replace(
        `/${this.activeProjectKey}/` + this.theIteration.key
      );
    },
  },
});
</script>
<style></style>
