import { register } from 'register-service-worker';
import { Notify } from 'quasar';
import { mdiCached } from '@quasar/extras/mdi-v6';
import { firebaseService } from 'src/services/firebase.service';
import { ILoggable, IProfile } from 'src/entities';
declare let window: any;

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
const ctx: Worker = self as any;

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(/* registration */) {
    console.log('sw ready')
  },

  registered(registration) {
    // console.log('Service worker has been registered.')
    listenToNotification(registration);
  },

  cached(/* registration */) {
    console.log('Content has been cached for offline use.')
  },

  updatefound(/* registration */) {
    console.log('New content is downloading.')
  },

  updated(/* registration */) {
    Notify.create({
      color: 'negative',
      icon: mdiCached,
      message: 'Update is available. Please reload the app.',
      timeout: 0,
      multiLine: true,
      position: 'top',
      actions: [
        {
          label: 'Refresh',
          color: 'yellow',
          handler: () => {
            if (typeof window == 'object') {
              window.location.reload();
            }
          }
        },
        {
          label: 'Dismiss',
          color: 'white',
          handler: () => {
            //
          }
        }
      ]
    })
  },

  offline() {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error(/* err */) {
    // console.error('Error during service worker registration:', err)
  },
});
const sent: Record<string, boolean> = {};
async function listenToNotification(registration: ServiceWorkerRegistration) {
  if (!('Notification' in window)) return;
  if (Notification.permission == 'granted') {
    await firebaseService.authenticate();
    const user = firebaseService.auth();
    let projects: string[] = [];
    const profile = user && (await firebaseService.get('profiles', user.uid) as { projects?: string[] });
    if (profile?.projects) {
      projects = profile.projects;
    } else if (user) {
      projects = (await firebaseService.findAll('projects', { 'members array-contains': user.uid }) || [])?.map(p => p.key as string);
    }
    if (user && projects?.length) {
      const date = new Date();
      const pad = (n: number, l = 2) => String(n).padStart(l, '0')
      const today = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
      firebaseService.streamWith<ILoggable>('logs', {
        'date >=': today,
        'operator !=': user.uid,
        'project in': projects
      }).subscribe({
        next(logs) {
          logs.forEach(async log => {
            if (sent[log.key] || !registration.active) return;
            const opKey = typeof log.operator == 'object' ? log.operator.key : log.operator;
            const operator = await firebaseService.get('profiles', opKey) as (IProfile | undefined);
            await registration.showNotification('ASC:' + log.type, {
              body: operator?.name,
              icon: (location?.origin || '') + '/icons/asc-icon.png',
              badge: operator?.avatar,
              silent: false,
              data: log.data,
              tag: log.key
            });
            (await registration.getNotifications({
              tag: log.key
            })).forEach(n => {
              n.onclick = () => {
                ctx.postMessage(log);
              }
            });
            sent[log.key] = true;
          })
        },
      })
    } else {
      registration.showNotification('ASC: No projects', {
        body: (user?.displayName || 'User') + ' has no project involvement',
        icon: (location?.origin || '') + '/icons/asc-icon.png',
        tag: 'no-projects',
        badge: user?.photoURL || undefined,
        vibrate: 1,
        silent: false,
      })
    }
  }
}
