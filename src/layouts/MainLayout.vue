<template>
  <q-layout
    view="hHh Lpr lff"
    :style="!$q.platform.is.desktop ? 'zoom: 75%' : ''"
  >
    <q-header reveal elevated>
      <div class="row bg-dark">
        <router-view name="header" />
      </div>
    </q-header>

    <q-drawer
      persistent
      v-model="leftDrawerOpen"
      behavior="desktop"
      mini
      side="left"
      class="no-scroll"
    >
      <router-view name="menu" />
    </q-drawer>
    <q-drawer
      v-model="rightDrawerOpen"
      persistent
      behavior="desktop"
      overlay
      mini
      side="right"
    >
      <router-view name="actions" />
      <q-page-sticky position="bottom-right" :offset="[5, 20]">
        <q-btn round size="lg" dense icon="home" to="/" />
      </q-page-sticky>
    </q-drawer>

    <q-page-container style="padding-right: 56px">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useProfilesStore } from 'src/stores/profiles.store';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
const profileStore = useProfilesStore();
const projectStore = useProjectStore();

export default defineComponent({
  name: 'MainLayout',

  components: {},

  data() {
    return {
      leftDrawerOpen: true,
      rightDrawerOpen: true,
      recentProfiles: [],
    };
  },
  async created() {
    await profileStore.init();
    await projectStore.init();
  },
  updated() {
    this.leftDrawerOpen = !!(this.$route.meta && this.$route.meta.actions);
  },
  beforeRouteUpdate() {
    this.leftDrawerOpen = !!(this.$route.meta && this.$route.meta.actions);
  },
  methods: {
    goto(link: string) {
      link.replace('/', '');
      //return this.$router.replace(link);
    },
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
  },
});
</script>
