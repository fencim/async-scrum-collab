<script lang="ts" setup>
import { defineProps, ref } from 'vue';
const validIcons = [
  'done',
  'task_alt',
  'arrow_right_alt',
  'add_task',
  'build',
  'pending',
  'assessment',
  'sync_alt',
  'question_mark',
  'disabled_by_default',
  'rule',
  'next_plan',
  'commit',
  'barcode_reader',
  'edit_document',
  'not_started',
  'done_all',
  'highlight_off',
];
defineProps({
  editable: Boolean,
  title: String,
  icon: {
    required: true,
    type: String,
  },
  size: String,
});
const emit = defineEmits(['update:icon']);
const selecting = ref(false);
function selectIcon(icon: string) {
  emit('update:icon', icon);
  selecting.value = false;
}
</script>
<template>
  <span>
    <q-icon :name="icon" @click="selecting = true" :size="size || 'xs'" />
    <q-dialog v-if="editable" v-model="selecting">
      <q-card>
        <q-card-section class="row justify-center q-pa-sm">
          <span class="col-12 text-center text-h6">{{
            title || 'Select Icon'
          }}</span>
          <q-icon :name="icon" size="lg" class="col-4" />
        </q-card-section>
        <q-card-actions>
          <q-table
            grid
            hide-bottom
            :rows="validIcons"
            :rows-per-page-options="[0]"
            table-class="row justify-center"
            card-class="col-4"
          >
            <template #item="{ row }">
              <q-btn
                :icon="row"
                @click="selectIcon(row)"
                size="sm"
                :label="row"
              />
            </template>
          </q-table>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </span>
</template>
