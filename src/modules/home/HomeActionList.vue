<template>
  <div>
    <q-list padding class="menu-list">
      <q-item clickable to="/project/new">
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-tooltip>New Project</q-tooltip>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomeActionList',
  components: {},
  data() {
    return {};
  },
  methods: {},
});
</script>
<style></style>
