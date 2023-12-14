<template>
  <q-dialog v-model="showItemTopSheet" :position="'top'">
    <q-card>
      <q-form @submit="submitIteration">
        <q-toolbar>
          <q-avatar>
            <img src="/icons/favicon-128x128.png" />
          </q-avatar>
          <q-toolbar-title
            ><span class="text-weight-bold">{{
              $route.params.iteration ? 'Edit' : 'New'
            }}</span>
            Iteration</q-toolbar-title
          >
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="row">
          <q-input
            v-model="theIteration.name"
            label="Name"
            class="col-12"
            :rules="[
              (v:string) => (v && v.length > 0) || 'Enter Iteration Name',
              (v:string) =>
                (v &&
                  !iterations.find(
                    (i:IIteration) => i.name.toLowerCase() == v.toLowerCase()
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
            v-if="!iterationPreFields.iteration"
            v-model="scheduleCeremonies"
            label="Schedule Iteration Ceremonies"
          />
        </q-card-section>
        <q-card-section
          v-if="!iterationPreFields.iteration && scheduleCeremonies"
        >
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
        <q-card-section v-if="saving" class="text-center">
          <q-linear-progress
            stripe
            rounded
            size="20px"
            :value="progress"
            color="warning"
            class="q-mt-sm"
          />
          {{ progressDetails }}
        </q-card-section>
        <q-card-actions :align="'right'">
          <q-btn icon="save" :loading="saving" type="submit">Save</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { date } from 'quasar';
import { IIteration } from 'src/entities';
import { useIterationStore } from 'src/stores/iterations.store';
import { TheWorkflows } from 'src/workflows/the-workflows';
import { Schedule } from 'src/workflows/iteration/definition';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { TheDialogs } from '../the-dialogs';
const iterationStore = useIterationStore();

const showItemTopSheet = ref(false);
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6].map((day) => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + day);
  return date.formatDate(d, 'ddd');
});

const activeProjectKey = ref('');
const theIteration = ref<Partial<IIteration>>({});
const scheduleCeremonies = ref(true);
const saving = ref(false);
const progress = ref(0);
const progressDetails = ref('');
const planSched = ref<Schedule[]>([]);
const range = ref<{ from?: string; to?: string }>({
  from: '',
  to: '',
});
const iterationPreFields = ref({
  iteration: undefined as IIteration | undefined,
  projectKey: undefined as string | undefined,
});
const $route = useRoute();
const $router = useRouter();
const ceremonies = computed<Schedule[]>(() => {
  const schedules: Schedule[] = [];
  if (!range.value.from || !range.value.to) return [];
  const start = new Date(range.value.from);
  const end = new Date(range.value.to);
  const [plan, review, retro]: Schedule[] = [
    {
      key: theIteration.value.key + 'plan',
      check: true,
      type: 'planning',
      start: new Date(start),
      end: new Date(start),
      desc: 'Planning',
    },
    {
      key: theIteration.value.key + 'reivew',
      check: true,
      start: new Date(end),
      end: new Date(end),
      desc: 'Reivew',
      type: 'review',
    },
    {
      key: theIteration.value.key + 'retro',
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
        key: theIteration.value.key + 'DS' + dayCounter,
        check: true,
        start: new Date(cursor),
        end: new Date(cursor),
        desc: `Daily Scrum (${dayCounter}) ${WEEKDAYS[cursor.getDay()]}`,
        type: 'scrum',
      };
      sched.end.setHours(20);
      schedules.push(sched);
    }
  }
  return schedules;
});

const iterations = computed(() => {
  return iterationStore.iterations;
});
async function init() {
  activeProjectKey.value =
    iterationPreFields.value.projectKey ||
    ($route.params.project && String($route.params.project)) ||
    '';
  const editing = iterationPreFields.value.iteration;
  if (!editing) {
    const iterations = iterationStore.iterations;
    const lastIteration = iterations[iterations.length - 1];
    const dateNow = lastIteration
      ? new Date(date.formatDate(lastIteration.end))
      : new Date();
    if (dateNow.getDay() != 1) {
      dateNow.setDate(dateNow.getDate() + (8 - dateNow.getDay()));
    }
    theIteration.value.projectKey = activeProjectKey.value;
    theIteration.value.key =
      activeProjectKey.value + 'S' + String(iterations.length);
    theIteration.value.start = date.formatDate(dateNow, 'YYYY/MM/DD');
    dateNow.setDate(dateNow.getDate() + 11);
    theIteration.value.end = date.formatDate(dateNow, 'YYYY/MM/DD');
  } else if (iterationStore.activeIteration) {
    theIteration.value = { ...iterationPreFields.value.iteration };
  }
  range.value = {
    from: theIteration.value.start,
    to: theIteration.value.end,
  };
  planSched.value = ceremonies.value;
}
async function submitIteration() {
  saving.value = true;
  const editing = iterationPreFields.value.iteration;
  if (!editing) {
    TheWorkflows.emit({
      type: 'createIteration',
      arg: {
        details: theIteration.value as IIteration,
        ceremonies: scheduleCeremonies.value ? planSched.value : [],
        progress: (update, details) => {
          progress.value = update;
          progressDetails.value = details || progressDetails.value;
        },
        done: (iteration) => {
          saving.value = false;
          $router.replace({
            name: 'iteration',
            params: {
              project: activeProjectKey.value,
              iteration: iteration.key,
            },
          });
        },
      },
    });
  } else {
    TheWorkflows.emit({
      type: 'updateIteration',
      arg: {
        iteration: theIteration.value as IIteration,
        done(iteration) {
          saving.value = false;
          $router.replace({
            name: 'iteration',
            params: {
              project: activeProjectKey.value,
              iteration: iteration.key,
            },
          });
        },
      },
    });
  }
}
TheDialogs.on({
  type: 'newIteration',
  async cb(e) {
    iterationPreFields.value.iteration = undefined;
    iterationPreFields.value.projectKey = e.projectKey;
    await init();
    showItemTopSheet.value = true;
  },
});
TheDialogs.on({
  type: 'editIteration',
  async cb(e) {
    iterationPreFields.value.iteration = e.iteration;
    iterationPreFields.value.projectKey = e.iteration.projectKey || '';
    await init();
    showItemTopSheet.value = true;
  },
});
</script>
<style></style>
