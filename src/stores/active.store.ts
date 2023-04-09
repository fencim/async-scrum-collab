import { defineStore } from 'pinia';
import { IProfile, IProject } from 'src/entities';
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
  },
  actions: {
    async selectProject(project: IProject) {
      const profileStore = useProfilesStore();
      this.activeProject = project;
      this.activeMembers = await profileStore.selectProjectMembers(project.members);
      this.administrators = await profileStore.selectProjectMembers(project.admins);
      this.moderators = await profileStore.selectProjectMembers(project.moderators);
      this.pendingMembers = await profileStore.selectProjectMembers(project.pending);
      this.guests = await profileStore.selectProjectMembers(project.guests);
    }
  }
});
