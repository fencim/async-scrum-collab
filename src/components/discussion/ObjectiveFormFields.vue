<script lang="ts" setup>
import { date } from 'quasar';
import { IIteration, IObjective } from 'src/entities';
import { useIterationStore } from 'src/stores/iterations.store';
import { onUpdated, ref } from 'vue';

const props = defineProps<{
  value: IObjective;
  iteration?: string | IIteration;
}>();
const theDiscussion = ref<IObjective>(props.value);
function withInIterationOnly(d: string) {
  const iterationStore = useIterationStore();
  let iteration = props.iteration;
  if (typeof iteration == 'string') {
    iteration = iterationStore.iterations.find((i) => i.key == iteration);
  }
  if (typeof iteration != 'object') return true;
  const start = date.formatDate(iteration.start, 'YYYY/MM/DD');
  const end = date.formatDate(iteration.end, 'YYYY/MM/DD');
  return (!iteration.start || d >= start) && (!iteration.end || d <= end);
}
const $emits = defineEmits(['input']);
onUpdated(() => {
  $emits('input', theDiscussion.value);
});
</script>
<template>
  <q-input
    class="col-12"
    v-model="theDiscussion.description"
    type="textarea"
    :rules="[(v) => (v && v.length > 0) || 'Enter Description']"
    label="Description"
  />
  <q-input class="col-6" v-model="theDiscussion.specifics" label="Specifics" />
  <q-input class="col-6" v-model="theDiscussion.measures" label="Measures" />
  <q-input class="col-6" v-model="theDiscussion.enables" label="Enables" />
  <q-input
    class="col-6"
    filled
    v-model="theDiscussion.dueDate"
    mask="date"
    label="Due"
    :rules="['date']"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy>
          <q-date
            v-model="theDiscussion.dueDate"
            :options="withInIterationOnly"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
