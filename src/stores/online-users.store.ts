import { defineStore } from 'pinia';
import { IOnlineUser } from 'src/entities/online-user.entity';
import { onlineUsersResource } from 'src/resources/online-users.resource';
import { useCeremonyStore } from './ceremonies.store';
import { useDiscussionStore } from './discussions.store';
import { useIterationStore } from './iterations.store';
import { useProfilesStore } from './profiles.store';
import { useProjectStore } from './projects.store';
import { date } from 'quasar';
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
    async init(activeProject: string) {
      this.onlineUsers = [];
      const dateTime = date.formatDate(new Date(), 'YYYY-MM-DD');
      const filter = { activeProject, 'lastActivityTime >=': dateTime };
      onlineUsersResource.streamWith(filter).subscribe({
        next: (users) => {
          this.onlineUsers = [...users];
          if (this.activeUser) {
            this.selectUser(this.activeUser.key);
          }
        },
      })
      this.onlineUsers = (await onlineUsersResource.findAllFrom(filter)) || [];
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
      const dateTime = date.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS');
      const result = await onlineUsersResource.setData(active.key, {
        ...active,
        activeProject: projectStore.activeProject?.key || active.activeProject || '',
        activeIteration: iterationStore.activeIteration?.key || active.activeIteration || '',
        activeCeremony: ceremonyStore.activeCeremony?.key ||
          discussionStore?.activeDiscussion?.ceremonyKey ||
          active.activeCeremony || '',
        activeDiscussion: discussionStore.activeDiscussion?.key || active.activeDiscussion || '',
        activeConvos: { ...active.activeConvos || {} },
        lastActivityTime: dateTime,
        organization: active.organization || '',
        status: 'active'
      });
      return result || active;
    },
  }
});
