<template>
  <q-page class="justify-evenly q-pa-sm">
    <div class="row">
      <q-card class="col q-ma-sm">
        <q-card-section
          >Admins ({{ activeStore.administrators.length }})</q-card-section
        >
        <q-card-section>
          <recent-active-members
            :profiles="activeStore.administrators"
            @click-profile="selectAdmin"
          />
        </q-card-section>
        <q-card-section v-if="selectedAdmins.length" class="bg-primary">
          <recent-active-members
            :profiles="selectedAdmins"
            @click-profile="unSelectAdmin"
          />
        </q-card-section>
        <q-card-actions v-if="selectedAdmins.length">
          <q-btn @click="adminsToMembers">As Member</q-btn>
          <q-btn @click="adminsToModerators">As Moderator</q-btn>
        </q-card-actions>
      </q-card>
      <q-card class="col q-ma-sm">
        <q-card-section
          >Moderators ({{ activeStore.moderators.length }})</q-card-section
        >
        <q-card-section>
          <recent-active-members
            :profiles="activeStore.moderators"
            @click-profile="selectModerator"
          />
        </q-card-section>
        <q-card-section v-if="selectedModerators.length" class="bg-primary">
          <recent-active-members
            :profiles="selectedModerators"
            @click-profile="unSelectModerator"
          />
        </q-card-section>
        <q-card-actions v-if="selectedModerators.length">
          <q-btn @click="moderatorsToMembers">As Member</q-btn>
          <q-btn @click="moderatorsToAdmins">As Admin</q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <div class="row">
      <q-card class="col q-ma-sm">
        <q-card-section
          >Pending ({{ activeStore.pendingMembers.length }})</q-card-section
        >
        <q-card-section>
          <recent-active-members
            :profiles="activeStore.pendingMembers"
            @click-profile="selectPending"
          />
        </q-card-section>
        <q-card-section v-if="selectedPending.length" class="bg-primary">
          <recent-active-members
            :profiles="selectedPending"
            @click-profile="unSelectPending"
          />
        </q-card-section>
        <q-card-actions v-if="selectedPending.length">
          <q-btn @click="pendingToMembers">As Member</q-btn>
          <q-btn @click="pendingToGuest">As Guest</q-btn>
        </q-card-actions>
      </q-card>
      <q-card class="col q-ma-sm">
        <q-card-section
          >Members ({{ activeStore.activeMembers.length }})</q-card-section
        >
        <q-card-section>
          <recent-active-members
            :profiles="activeStore.activeMembers"
            @click-profile="selectMember"
          />
        </q-card-section>
        <q-card-section v-if="selectedMembers.length" class="bg-primary">
          <recent-active-members
            :profiles="selectedMembers"
            @click-profile="unSelectMember"
          />
        </q-card-section>
        <q-card-actions v-if="selectedMembers.length">
          <q-btn @click="membersToModerators">As Moderator</q-btn>
          <q-btn @click="membersToGuests">As Guest</q-btn>
        </q-card-actions>
      </q-card>
      <q-card class="col q-ma-sm">
        <q-card-section
          >Guests ({{ activeStore.guests.length }})</q-card-section
        >
        <q-card-section>
          <recent-active-members
            :profiles="activeStore.guests"
            @click-profile="selectGuest"
          />
        </q-card-section>
        <q-card-section v-if="selectedGuests.length" class="bg-primary">
          <recent-active-members
            :profiles="selectedGuests"
            @click-profile="unSelectGuest"
          />
        </q-card-section>
        <q-card-actions v-if="selectedGuests.length">
          <q-btn @click="guestsToMembers">As Member</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { IProfile } from 'src/entities';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
import { useActiveStore } from 'src/stores/active.store';

const projectStore = useProjectStore();
const activeStore = useActiveStore();
export default defineComponent({
  name: 'MembersPage',
  components: { RecentActiveMembers },
  data() {
    return {
      activeStore,
      selectedAdmins: [] as IProfile[],
      selectedPending: [] as IProfile[],
      selectedModerators: [] as IProfile[],
      selectedGuests: [] as IProfile[],
      selectedMembers: [] as IProfile[],
    };
  },
  async mounted() {
    await this.resetSelected();
  },

  methods: {
    resetSelected() {
      this.selectedAdmins = [];
      this.selectedModerators = [];
      this.selectedGuests = [];
      this.selectedPending = [];
      this.selectedMembers = [];
    },
    selectAdmin(profile: IProfile) {
      if (!this.selectedAdmins.find((m) => m.key == profile.key)) {
        this.selectedAdmins.push(profile);
      }
    },
    unSelectAdmin(profile: IProfile) {
      const index = this.selectedAdmins.findIndex((m) => m.key == profile.key);
      if (index >= 0) {
        this.selectedAdmins.splice(index, 1);
      }
    },
    selectModerator(profile: IProfile) {
      if (!this.selectedModerators.find((m) => m.key == profile.key)) {
        this.selectedModerators.push(profile);
      }
    },
    unSelectModerator(profile: IProfile) {
      const index = this.selectedModerators.findIndex(
        (m) => m.key == profile.key
      );
      if (index >= 0) {
        this.selectedModerators.splice(index, 1);
      }
    },
    selectPending(profile: IProfile) {
      if (!this.selectedPending.find((m) => m.key == profile.key)) {
        this.selectedPending.push(profile);
      }
    },
    unSelectPending(profile: IProfile) {
      const index = this.selectedPending.findIndex((m) => m.key == profile.key);
      if (index >= 0) {
        this.selectedPending.splice(index, 1);
      }
    },
    selectMember(profile: IProfile) {
      if (!this.selectedMembers.find((m) => m.key == profile.key)) {
        this.selectedMembers.push(profile);
      }
    },
    unSelectMember(profile: IProfile) {
      const index = this.selectedMembers.findIndex((m) => m.key == profile.key);
      if (index >= 0) {
        this.selectedMembers.splice(index, 1);
      }
    },
    selectGuest(profile: IProfile) {
      if (!this.selectedGuests.find((m) => m.key == profile.key)) {
        this.selectedGuests.push(profile);
      }
    },
    unSelectGuest(profile: IProfile) {
      const index = this.selectedGuests.findIndex((m) => m.key == profile.key);
      if (index >= 0) {
        this.selectedGuests.splice(index, 1);
      }
    },
    async adminsToMembers() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedAdmins,
        'members',
        'admins'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async adminsToModerators() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedAdmins,
        'moderators',
        'admins'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async moderatorsToAdmins() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedModerators,
        'admins',
        'moderators'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async moderatorsToMembers() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedModerators,
        'members',
        'moderators'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async pendingToMembers() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedPending,
        'members',
        'pending'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async pendingToGuest() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedPending,
        'guests',
        'pending'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async membersToModerators() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedMembers,
        'moderators',
        'members'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async membersToGuests() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedMembers,
        'guests',
        'members'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async guestsToMembers() {
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedGuests,
        'members',
        'guests'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
  },
});
</script>
<style></style>
