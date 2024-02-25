<template>
  <q-page class="justify-evenly q-pa-sm">
    <q-chip size="xl" icon="settings"> Project Setting </q-chip>
    <q-separator />
    <q-chip size="lg" icon="group"> Project Members </q-chip>
    <div class="row">
      <q-card class="col q-ma-sm">
        <q-card-section
          >Admins ({{ activeStore.administrators.length }})</q-card-section
        >
        <q-card-section>
          <recent-active-members
            :max-count="15"
            :profiles="activeStore.administrators"
            @click-profile="selectAdmin"
          />
        </q-card-section>
        <q-card-section v-if="selectedAdmins.length" class="bg-primary">
          <recent-active-members
            :max-count="15"
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
            :max-count="15"
            :profiles="activeStore.moderators"
            @click-profile="selectModerator"
          />
        </q-card-section>
        <q-card-section v-if="selectedModerators.length" class="bg-primary">
          <recent-active-members
            :max-count="15"
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
            :max-count="15"
            @click-profile="selectPending"
          />
        </q-card-section>
        <q-card-section v-if="selectedPending.length" class="bg-primary">
          <recent-active-members
            :profiles="selectedPending"
            :max-count="15"
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
            :max-count="15"
            @click-profile="selectMember"
          />
        </q-card-section>
        <q-card-section v-if="selectedMembers.length" class="bg-primary">
          <recent-active-members
            :profiles="selectedMembers"
            :max-count="15"
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
            :max-count="15"
            :profiles="activeStore.guests"
            @click-profile="selectGuest"
          />
        </q-card-section>
        <q-card-section v-if="selectedGuests.length" class="bg-primary">
          <recent-active-members
            :profiles="selectedGuests"
            :max-count="15"
            @click-profile="unSelectGuest"
          />
        </q-card-section>
        <q-card-actions v-if="selectedGuests.length">
          <q-btn @click="guestsToMembers">As Member</q-btn>
          <q-btn @click="guestsToPending">As Pending</q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <q-separator />
    <q-chip size="lg" icon="view_column">Taskboard</q-chip>
    <div class="row">
      <q-chip
        size="md"
        class="col-12"
        icon="view_week"
        clickable
        @click="
          TheDialogs.emit({
            type: 'scrumGuide',
            arg: {
              keyword: 'individuals',
            },
          })
        "
        >Status Columns</q-chip
      >
      <draggable
        :list="taskboardColumns"
        item-key="key"
        @change="columnsSaved = false"
      >
        <template #footer
          ><q-btn
            icon="add"
            color="primary"
            class="q-pr-md"
            rounded
            dense
            @click="createNewCol()"
            >New Column</q-btn
          ></template
        >
        <template #item="{ element, index }">
          <q-chip
            class="non-selectable"
            :style="{
              'background-color':
                element.color ||
                (element.doneState
                  ? 'positive'
                  : index == 0
                  ? 'accent'
                  : 'secondary'),
            }"
            :color="
              element.color ||
              (element.doneState
                ? 'positive'
                : index == 0
                ? 'accent'
                : 'secondary')
            "
          >
            <icon-picker
              :icon="element.icon || 'done'"
              :title="element.name"
              editable
              @update:icon="(v) => (element.icon = v)"
            />
            {{ element.name }}
            &nbsp;
            <q-btn
              dense
              size="sm"
              round
              icon="edit"
              @click="editBoardColumn(element)"
            ></q-btn>
          </q-chip>
        </template>
      </draggable>
    </div>
    <q-separator />
    <div v-if="activeStore.activeProject" class="row">
      <q-chip size="md" class="col-12" icon="checklist"
        >Discussion Ready for Work
        <q-tooltip>
          <MarkdownPreview :source="md" />
        </q-tooltip>
      </q-chip>
      <q-slider
        class="q-px-xl"
        label-always
        v-model="issueReadynesss"
        markers
        :marker-labels="(val) => (val == 0 ? '0%' : val == 1 ? '100%' : ' ')"
        :label-value="(issueReadynesss * 100).toFixed(0) + '%'"
        :step="0.05"
        switch-label-side
        :min="0"
        :max="1"
      ></q-slider>
    </div>
    <q-separator />
    <q-chip size="lg" icon="display_settings"
      >Project Status : {{ activeStore.activeProject?.status }}</q-chip
    >
    <div class="row q-my-md">
      <q-btn
        color="negative"
        :disable="activeStore.activeProject?.status != 'active'"
        rounded
        @click="confirmClose = true"
        icon="phonelink_erase"
        >Close Project</q-btn
      >
      <q-separator />
      <q-btn
        color="primary"
        v-if="activeStore.activeProject?.status != 'active'"
        rounded
        @click="activateProject"
        icon="auto_fix_normal"
        >Activate Project</q-btn
      >
      <q-separator />
      <q-btn
        :disable="activeStore.activeProject?.status == 'disabled'"
        rounded
        @click="confirmDisable = true"
        icon="disabled_by_default"
      >
        Disable Project</q-btn
      >
      <q-space class="col" />
      <q-btn
        rounded
        icon="save"
        :disable="settingsSaved"
        :loading="saving"
        color="primary"
        @click="saveProject()"
        >Save Project</q-btn
      >
    </div>
    <q-dialog v-model="confirmClose" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="phonelink_erase" color="primary" text-color="white" />
          <span class="q-ml-sm">You are about to close the project.</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Proceed"
            @click="closeProject"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmDisable" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar
            icon="disabled_by_default"
            color="primary"
            text-color="white"
          />
          <span class="q-ml-sm">You are about to disable the project.</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Proceed"
            @click="disableProject"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="editColumn">
      <q-card :style="{ width: $q.screen.sizes.sm + 'px' }">
        <q-card-section
          class="row"
          :style="{
            'background-color':
              editingCol.color == 'white' ? 'transparent' : editingCol.color,
          }"
        >
          <icon-picker
            class="col-1 cursor-pointer self-center"
            :icon="editingCol.icon || 'done'"
            editable
            size="md"
            :title="editingCol.name || ''"
            @update:icon="(v) => (editingCol.icon = v)"
          />
          <q-input
            class="col"
            :label="editingCol.key"
            v-model="editingCol.name"
          />
          <q-checkbox
            class="col-2"
            label="Done State"
            v-model="editingCol.doneState"
          />
          <q-icon
            :color="editingCol.color"
            name="colorize"
            size="md"
            class="col-1 cursor-pointer self-center"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-color
                :model-value="editingCol.color"
                @change="
                  (val) => {
                    editingCol.color = val;
                  }
                "
              />
            </q-popup-proxy>
          </q-icon>
        </q-card-section>
        <q-card-actions class="row justify-center">
          <q-btn
            v-if="editingCol != newBoardCol"
            icon="delete"
            color="negative"
            class="col-3"
            @click="confirmDeleteCol = true"
          />
          <q-space class="col3" />
          <q-btn
            @click="editColumn = false"
            color="secondary"
            icon="close"
            class="col-3"
          />
          <q-btn
            @click="saveTaskColumn(editingCol)"
            icon="save"
            color="primary"
            class="col-3"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmDeleteCol" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="primary" text-color="white" />
          <span class="q-ml-sm">Deleting board column?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Proceed"
            @click="deleteTaskColumn(editingCol)"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import draggable from 'vuedraggable';
import IconPicker from 'src/components/IconPickerComponent.vue';
import MarkdownPreview from '@uivjs/vue-markdown-preview';
import { IProfile, IBoardColumn } from 'src/entities';
import RecentActiveMembers from 'src/components/RecentActiveMembers.vue';
import { useProjectStore } from 'src/stores/projects.store';
import { defineComponent } from 'vue';
import { useActiveStore } from 'src/stores/active.store';
import md from 'src/guides/discussion-readiness.guide.md?raw';
import { TheDialogs } from 'src/dialogs/the-dialogs';
import { TheWorkflows } from 'src/workflows/the-workflows';

function createNewBoardCol() {
  return {
    key: 'new',
    name: 'New',
    icon: 'done',
  } as IBoardColumn;
}
const projectStore = useProjectStore();
const activeStore = useActiveStore();
export default defineComponent({
  name: 'ProjectSettingsPage',
  components: {
    RecentActiveMembers,
    draggable,
    IconPicker,
    MarkdownPreview,
  },
  data() {
    const defaultNewBoardCol = createNewBoardCol();
    return {
      activeStore,
      TheDialogs,
      selectedAdmins: [] as IProfile[],
      selectedPending: [] as IProfile[],
      selectedModerators: [] as IProfile[],
      selectedGuests: [] as IProfile[],
      selectedMembers: [] as IProfile[],
      confirmDisable: false,
      confirmClose: false,
      editColumn: false,
      confirmDeleteCol: false,
      issueReadynesss: 0,
      saving: false,
      columnsSaved: true,
      taskboardColumns: [] as IBoardColumn[],
      newBoardCol: defaultNewBoardCol,
      editingCol: defaultNewBoardCol,
      md,
    };
  },
  computed: {
    pending() {
      return activeStore.pendingMembers;
    },
    settingsSaved() {
      const ready = activeStore.activeProject?.discussionReadiness || 0;
      return this.columnsSaved && ready == this.issueReadynesss;
    },
  },
  mounted() {
    this.resetSelected();

    this.taskboardColumns =
      activeStore.activeProject?.boardColumns?.map((c) => ({ ...c })) || [];
    if (!this.taskboardColumns?.length) {
      this.taskboardColumns = [
        {
          key: 'to-do',
          name: 'To do',
          icon: 'not_started',
        },
        {
          key: 'in-progress',
          name: 'In Progress',
          icon: 'pending',
        },
        {
          key: 'done',
          name: 'Done',
          icon: 'done',
          doneState: true,
        },
      ];
      this.columnsSaved = false;
    }
    this.issueReadynesss = activeStore.activeProject?.discussionReadiness || 0;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
      if (!this.activeStore.canUserModerate) return;
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
    async guestsToPending() {
      if (!this.activeStore.canUserModerate) return;
      if (!activeStore.activeProject) return;
      await projectStore.setProjectMember(
        activeStore.activeProject,
        this.selectedGuests,
        'pending',
        'guests'
      );
      await activeStore.selectProject(activeStore.activeProject);
      this.resetSelected();
    },
    async disableProject() {
      if (!this.activeStore.canUserModerate) return;
      if (!activeStore.activeProject) return;
      await projectStore.updateSettings(
        activeStore.activeProject.key,
        'status',
        'disabled'
      );
    },
    async closeProject() {
      if (!this.activeStore.canUserModerate) return;
      if (!activeStore.activeProject) return;
      await projectStore.updateSettings(
        activeStore.activeProject.key,
        'status',
        'closed'
      );
    },
    async activateProject() {
      if (!this.activeStore.canUserModerate) return;
      if (!activeStore.activeProject) return;
      TheWorkflows.emit({
        type: 'updateProjectSettings',
        arg: {
          project: activeStore.activeProject,
          settings: 'status',
          value: 'active',
        },
      });
      await projectStore.updateSettings(
        activeStore.activeProject.key,
        'status',
        'active'
      );
    },
    createNewCol() {
      this.editingCol = this.newBoardCol;
      this.editColumn = true;
    },
    updateBoardColumnIcon(col: IBoardColumn, icon: string) {
      this.columnsSaved = this.columnsSaved && col.icon == icon;
      col.icon = icon;
    },
    editBoardColumn(col: IBoardColumn) {
      if (!this.activeStore.canUserModerate) return;
      this.editingCol = { ...col };
      this.editColumn = true;
    },
    saveTaskColumn(col: IBoardColumn) {
      if (!this.activeStore.canUserModerate) return;
      if (col === this.newBoardCol) {
        const savingCol = {
          ...col,
          key: col.name.replace(/[\s]+/g, '_').toLowerCase(),
        };
        const index = this.taskboardColumns.findIndex(
          (c) => c.key == savingCol.key
        );
        if (index < 0) {
          this.taskboardColumns.push(savingCol);
          this.newBoardCol = createNewBoardCol();
        } else {
          this.$q.notify({
            message: 'Duplicate column',
            color: 'negative',
          });
        }
      } else {
        const index = this.taskboardColumns.findIndex((c) => c.key == col.key);
        if (index >= 0) {
          this.taskboardColumns.splice(index, 1, { ...col });
        }
      }
      this.editColumn = false;
      this.columnsSaved = false;
    },
    deleteTaskColumn(col: IBoardColumn) {
      if (!this.activeStore.canUserModerate) return;
      const index = this.taskboardColumns.findIndex((c) => c.key == col.key);
      if (index >= 0) {
        this.taskboardColumns.splice(index, 1);
        this.editColumn = false;
        this.columnsSaved = false;
      }
    },
    async saveProject() {
      if (!activeStore.activeProject || !activeStore.canUserModerate) return;
      this.saving = true;
      if (!this.columnsSaved) {
        //save taskboard columns
        await projectStore.saveProjectColumns(
          activeStore.activeProject.key,
          this.taskboardColumns
        );
        this.columnsSaved = true;
      }
      if (
        activeStore.activeProject.discussionReadiness !== this.issueReadynesss
      ) {
        //save readiness here
        TheWorkflows.emit({
          type: 'updateProjectSettings',
          arg: {
            project: activeStore.activeProject,
            settings: 'discussionReadiness',
            value: this.issueReadynesss,
            done: () => {
              this.saving = false;
            },
          },
        });
      } else {
        this.saving = false;
      }
    },
  },
});
</script>
<style></style>
