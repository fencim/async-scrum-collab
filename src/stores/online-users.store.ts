import { defineStore } from 'pinia';
import { IOnlineUser } from 'src/entities/online-user.entity';
import { onlineUsersResource } from 'src/resources/online-users.resource';
import { useCeremonyStore } from './ceremonies.store';
import { useDiscussionStore } from './discussions.store';
import { useIterationStore } from './iterations.store';
import { useProfilesStore } from './profiles.store';
import { useProjectStore } from './projects.store';
interface IOnlineUsersState {
  onlineUsers: IOnlineUser[];
  activeUser?: IOnlineUser;
}
export const useOnlineUsersStore = defineStore('onlineUsersStore', {
  state: () => ({
    onlineUsers: []
  } as IOnlineUsersState),
  getters: {
  },
  actions: {
    async init() {
      onlineUsersResource.streamWith().subscribe({
        next: (users) => {
          this.onlineUsers = [...users];
          if (this.activeUser) {
            this.selectUser(this.activeUser.key);
          }
        },
      })
      this.onlineUsers = (await onlineUsersResource.findAllFrom()) || [];
    },
    async selectUser(key: string) {
      if (key) {
        const user = this.onlineUsers.find(p => p.key == key) || await onlineUsersResource.findOne({ key });
        this.activeUser = user;
        if (user) {
          //
        }
        return user;
      } else {
        this.activeUser = undefined;
      }
    },
    async saveActive(active: IOnlineUser) {
      const profileStore = useProfilesStore();
      const projectStore = useProjectStore();
      const iterationStore = useIterationStore();
      const ceremonyStore = useCeremonyStore();
      const discussionStore = useDiscussionStore();
      active.key = profileStore.theUser?.key || active.key || '';
      await onlineUsersResource.setData(active.key, {
        ...active,
        activeProject: projectStore.activeProject?.key || active.activeProject || '',
        activeIteration: iterationStore.activeIteration?.key || active.activeIteration || '',
        activeCeremony: ceremonyStore.activeCeremony?.key ||
          discussionStore?.activeDiscussion?.ceremonyKey ||
          active.activeCeremony || '',
        activeDiscussion: discussionStore.activeDiscussion?.key || active.activeDiscussion || '',
        activeConvos: { ...active.activeConvos || {} },
        lastActivityTime: (new Date()).toISOString(),
        organization: active.organization || '',
        status: 'active'
      });
      return active;
    },
  }
});
