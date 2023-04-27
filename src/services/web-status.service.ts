/* eslint-disable @typescript-eslint/no-floating-promises */
import { uid } from 'quasar';
import pkg from '../../package.json';
import { Observable, Subscriber } from 'rxjs';
import { Axios } from 'axios';
const api = new Axios();
type WebStatus = { isOnline?: boolean; isAuth?: boolean };
let subscriber: Subscriber<WebStatus>;
const observable = new Observable<WebStatus>((sub) => {
  subscriber = sub;
});
function updateStatus(status?: WebStatus) {
  let { isOnline } = status || {};
  isOnline = typeof isOnline == 'undefined' ? navigator.onLine : isOnline;
  subscriber?.next(
    typeof status != 'undefined'
      ? status
      : {
        isOnline,
      }
  );

  // $store.ref?.dispatch('webStatus/updateOnlineStatus', isOnline);
  // if (typeof status?.isAuth !== 'undefined') {
  //   $store.ref?.commit('webStatus/setAuthStatus', status?.isAuth);
  // }
}

window.addEventListener('DOMContentLoaded', () => {
  updateStatus();
  window.addEventListener('offline', () => updateStatus);
  window.addEventListener('online', () => updateStatus);
});

class WebStatusService {
  isOnline = navigator.onLine;
  updateApp() {
    const wndow = window as unknown as { reload: (force: boolean) => void };
    if (typeof wndow.reload == 'function') {
      wndow.reload(true);
    }
    if (typeof window.location.reload == 'function') {
      window.location.reload();
    }
  }
  getCurrentVersion() {
    return pkg.version;
  }
  async checkForAvailableUpdates() {
    if (process.env.MODE != 'pwa') return;
    try {
      await new Promise((r) => setTimeout(r, 10 * 1000));

      const respose = await api.get('manifest.json?=' + uid());
      if (respose.status == 200) {
        const data = respose.data as { version: string };
        const updatesAvailable = data.version !== pkg.version && data.version;
        if (updatesAvailable) {

        }
        return updatesAvailable;
      }
    } catch {
      updateStatus({ isOnline: false });
    }
  }
  subscribe(cb: (status: WebStatus) => void) {
    observable.subscribe(cb);
  }
  updateStatus(status: WebStatus) {
    updateStatus(status);
  }
}

export const webStatusService = new WebStatusService();
