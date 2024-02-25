import { defineStore } from 'pinia';
import { IProfile, IProject, MembershipType } from 'src/entities';
import { useProfilesStore } from './profiles.store';

interface IActiveState {
  activeProject?: IProject;
  activeMembers: IProfile[];
  pendingMembers: IProfile[];
  administrators: IProfile[];
  moderators: IProfile[];
  guests: IProfile[];
}
export const useActiveStore = defineStore('activeStore', {
  state: () => ({
    activeMembers: [],
    pendingMembers: [],
    administrators: [],
    moderators: [],
    guests: []
  } as IActiveState),
  getters: {
    canUserModerate(): boolean {
      const profileStore = useProfilesStore();
      return !![...this.administrators, ... this.moderators].find(m => m.key == profileStore.theUser?.key);
    },
    canOperateOnProject(): boolean {
      const role = this.userRole;
      return (['admin', 'moderator', 'member'] as MembershipType[]).includes(role);
    },
    userRole(): MembershipType {
      const profileStore = useProfilesStore();
      if (this.administrators.find(m => m.key == profileStore.theUser?.key)) {
        return 'admin'
      } else if (this.moderators.find(m => m.key == profileStore.theUser?.key)) {
        return 'moderator';
      } else if (this.moderators.find(m => m.key == profileStore.theUser?.key)) {
        return 'moderator';
      } else if (this.pendingMembers.find(m => m.key == profileStore.theUser?.key)) {
        return 'pending';
      } else if (this.guests.find(m => m.key == profileStore.theUser?.key)) {
        return 'guest';
      } else {
        return 'anonymous'
      }
    }
  },
  actions: {
    async selectProject(project: IProject) {
      const profileStore = useProfilesStore();
      this.activeProject = project;
      this.activeMembers = [];
      this.administrators = [];
      this.moderators = [];
      this.pendingMembers = [];
      this.guests = [];
      this.activeMembers = await profileStore.selectProjectMembers(project.members);
      this.administrators = await profileStore.selectProjectMembers(project.admins);
      this.moderators = await profileStore.selectProjectMembers(project.moderators);
      this.pendingMembers = await profileStore.selectProjectMembers(project.pending);
      this.guests = await profileStore.selectProjectMembers(project.guests);
    }
  }
});
