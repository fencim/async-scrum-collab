<script lang="ts" setup>
import { IStory } from 'src/entities';
import { defineProps, PropType, ref } from 'vue';
const props = defineProps({
  task: {
    required: true,
    type: Object as PropType<IStory>,
  },
  maxed: Boolean,
});
const showDetails = ref(false);
</script>
<template>
  <div>
    <q-list>
      <q-item v-if="showDetails || props.maxed">
        <q-item-section>
          <q-item-label>
            {{
              `As ${props.task.targetUser}, I want to ${props.task.subject}, so that ${props.task.purpose}`
            }}
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
      <q-item
        v-for="(item, index) in props.task.acceptanceCriteria"
        :key="index"
      >
        <q-item-section>
          <q-item-label> Given {{ item.given }} </q-item-label>
          <q-item-label caption> When {{ item.when }} </q-item-label>
          <q-item-label> Then {{ item.then }} </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
