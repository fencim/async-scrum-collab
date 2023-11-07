<script lang="ts" setup>
import { TechnicalTask } from 'src/entities';
import { defineProps, PropType } from 'vue';
const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<TechnicalTask>,
  },
});
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
    </q-list>
  </div>
</template>
