<script lang="ts" setup>
import { IGoal } from 'src/entities';
import { defineProps, PropType, ref } from 'vue';
const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<IGoal>,
  },
  maxed: Boolean,
});
const showDetails = ref(false);
</script>
<template>
  <div>
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label>
            {{ props.task.description }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-chip dense color="primary">{{
            props.task.priority || 'P1'
          }}</q-chip>
          <q-chip dense color="secondary">{{
            props.task.dueDate || 'No Due'
          }}</q-chip>
        </q-item-section>
      </q-item>
      <q-item v-if="showDetails || props.maxed">
        {{ props.task.info }}
      </q-item>
    </q-list>
  </div>
</template>
