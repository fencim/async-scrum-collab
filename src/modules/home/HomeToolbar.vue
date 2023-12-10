<template>
  <q-toolbar class="ticket-toobar">
    <the-present-project />
    <q-toolbar-title>Async Scrum Collab</q-toolbar-title>
    <TheSynchronizer />
    <the-present-user />
  </q-toolbar>
</template>

<script lang="ts">
import { useProfilesStore } from 'src/stores/profiles.store';
import { defineComponent } from 'vue';
import ThePresentUser from 'components/ThePresentUser.vue';
import ThePresentProject from 'components/ThePresentProject.vue';
import TheSynchronizer from 'src/components/TheSynchronizer.vue';

export default defineComponent({
  name: 'HomeToolbar',
  components: { ThePresentUser, ThePresentProject, TheSynchronizer },
  data() {
    return {
      profilesStore: useProfilesStore(),
    };
  },
  mounted() {
    this.init();
  },
  updated() {
    this.init();
  },
  methods: {
    init() {
      //
    },
  },
});
</script>
<style></style>
