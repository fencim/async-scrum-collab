<template>
  <q-page class="justify-evenly q-pa-sm">
    <div class="row">
      <q-card class="col q-ma-sm">
        <q-card-section>Admins ({{ admins.length }})</q-card-section>
        <q-card-section>
          <recent-active-members
            :profiles="admins"
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
        <q-card-section>Moderators ({{ moderators.length }})</q-card-section>
        <q-card-section>
          <recent-active-members
            :profiles="moderators"
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
        <q-card-section>Pending ({{ pending.length }})</q-card-section>
        <q-card-section>
          <recent-active-members
            :profiles="pending"
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
        <q-card-section>Members ({{ members.length }})</q-card-section>
        <q-card-section>
          <recent-active-members
            :profiles="members"
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
        <q-card-section>Guests ({{ guests.length }})</q-card-section>
        <q-card-section>
          <recent-active-members
            :profiles="guests"
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
import { useProfilesStore } from 'src/stores/profiles.store';

const profileStore = useProfilesStore();
const projectStore = useProjectStore();

export default defineComponent({
  name: 'MembersPage',
  components: { RecentActiveMembers },
  data() {
    return {
      projectStore,
      admins: [] as IProfile[],
      selectedAdmins: [] as IProfile[],
      pending: [] as IProfile[],
      selectedPending: [] as IProfile[],
      moderators: [] as IProfile[],
      selectedModerators: [] as IProfile[],
      guests: [] as IProfile[],
      selectedGuests: [] as IProfile[],
      members: [] as IProfile[],
      selectedMembers: [] as IProfile[],
    };
  },
  async mounted() {
    await this.loadMembers();
  },
  methods: {
    async loadMembers() {
      this.admins = await profileStore.selectProjectMembers(
        projectStore.activeProject?.admins || []
      );
      this.selectedAdmins = [];
      this.moderators = await profileStore.selectProjectMembers(
        projectStore.activeProject?.moderators || []
      );
      this.selectedModerators = [];
      this.guests = await profileStore.selectProjectMembers(
        projectStore.activeProject?.guests || []
      );
      this.selectedGuests = [];
      this.pending = await profileStore.selectProjectMembers(
        projectStore.activeProject?.pending || []
      );
      this.selectedPending = [];
      this.members = await profileStore.selectProjectMembers(
        projectStore.activeProject?.members || []
      );
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
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedAdmins,
        'member',
        'admin'
      );
      await this.loadMembers();
    },
    async adminsToModerators() {
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedAdmins,
        'moderator',
        'admin'
      );
      await this.loadMembers();
    },
    async moderatorsToAdmins() {
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedModerators,
        'admin',
        'moderator'
      );
      await this.loadMembers();
    },
    async moderatorsToMembers() {
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedModerators,
        'member',
        'moderator'
      );
      await this.loadMembers();
    },
    async pendingToMembers() {
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedPending,
        'member',
        'pending'
      );
      await this.loadMembers();
    },
    async pendingToGuest() {
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedPending,
        'guest',
        'pending'
      );
      await this.loadMembers();
    },
    async membersToModerators() {
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedMembers,
        'moderator',
        'member'
      );
      await this.loadMembers();
    },
    async membersToGuests() {
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedMembers,
        'guest',
        'member'
      );
      await this.loadMembers();
    },
    async guestsToMembers() {
      if (!projectStore.activeProject) return;
      await projectStore.setProjectMember(
        projectStore.activeProject,
        this.selectedGuests,
        'member',
        'guest'
      );
      await this.loadMembers();
    },
  },
});
</script>
<style></style>
