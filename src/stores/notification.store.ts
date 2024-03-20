import { defineStore } from 'pinia';
import { ILoggable } from 'src/entities';
export interface NotificationInfo {
  tag: string;
  title: string;
  body: string;
  badge?: string;
  log?: ILoggable
}
interface INotificationState {
  notifications: NotificationInfo[]
}
export const useNotificationStore = defineStore(
  'notification', {
  state: () => ({
  } as INotificationState),
  actions: {
    async load() {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const list = await registration.getNotifications();
        this.notifications = list.map((n) => {
          n.addEventListener('close', () => {
            const index = this.notifications.findIndex(notification => n.tag == notification.tag);
            if (index >= 0) {
              this.notifications.splice(index, 1);
            }
          })
          return {
            body: n.body,
            badge: n.icon,
            title: n.title,
            tag: n.tag,
            log: n.data as ILoggable
          }
        });

      }
    },
    newNotification(payload: NotificationInfo) {
      this.notifications.push(payload);
    }
  }
});
