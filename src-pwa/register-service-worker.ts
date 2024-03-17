import { register } from 'register-service-worker';
import { Notify } from 'quasar';
import { mdiCached } from '@quasar/extras/mdi-v6';
import { firebaseService } from 'src/services/firebase.service';
declare let window: any;

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready(/* registration */) {
    console.log('Service worker is active.')
    firebaseService.authenticate().then((user) => {
      console.log('SW is ready with  ', user)
    });
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
async function listenToNotification(registration: ServiceWorkerRegistration) {
  if (!('Notification' in window)) return;
  if (Notification.permission == 'granted') {
    const cb = (payload: object) => {
      // Customize notification here
      const notificationTitle = 'Background Message Title';
      const notificationOptions = {
        body: 'Test',
        icon: '/icons/asc-icon.png'
      };
      registration.showNotification(notificationTitle, notificationOptions);
    })
  }
}
