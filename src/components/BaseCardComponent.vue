<script lang="ts" setup>
import { defineProps, ref } from 'vue';
defineProps({
  mini: Boolean,
  maxed: Boolean,
});
const showDetails = ref(false);
</script>
<template>
  <q-card-section class="q-px-sm no-shadow">
    <div class="row full-width">
      <div class="col self-center">
        <slot name="title" />
      </div>
      <div class="col-4 row justify-end">
        <slot name="side" />
      </div>
    </div>
  </q-card-section>
  <div>
    <div
      class="row q-px-sm full-width justify-end q-py-xs"
      v-if="!!$slots['details'] && (showDetails || maxed || !mini)"
    >
      <slot name="details" />
    </div>
    <div
      class="row q-px-sm full-width justify-end q-py-xs"
      v-if="!!$slots['footer']"
    >
      <slot name="footer" />
    </div>
    <div class="row full-width" v-if="!!$slots['bottom']">
      <slot name="bottom" />
    </div>
  </div>
  <q-btn
    v-if="!$slots['dropdown']"
    class="float-right vertical-middle"
    @click="showDetails = !showDetails"
    size="xs"
    icon="circle"
    dense
    flat
  />
  <q-btn-dropdown
    v-else
    unelevated
    padding="0"
    dropdown-icon="circle"
    :outline="false"
    class="float-right vertical-middle"
    size="xs"
    dense
    flat
  >
    <slot name="dropdown" />
  </q-btn-dropdown>
</template>
