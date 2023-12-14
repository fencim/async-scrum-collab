<template>
  <div>
    <q-list padding class="menu-list">
      <q-item
        clickable
        @click="
          TheDialogs.emit({
            type: 'newProject',
            arg: {},
          })
        "
      >
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-tooltip>New Project</q-tooltip>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts" setup>
import { TheDialogs } from 'src/dialogs/the-dialogs';
</script>
<style></style>
