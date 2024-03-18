/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => void };

import { ILoggable, IProfile } from 'src/entities';
import { firebaseService } from 'src/services/firebase.service';
import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Non-SSR fallback to index.html
// Production SSR fallback to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] }
    )
  );
}

listenToNotification();
self.addEventListener('online', () => {
  firebaseService.authenticate();
})
self.addEventListener('notificationclick', (event) => {
  console.log('notification click', event.notification);

  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) return client.focus();
        }
        self.clients.openWindow('/');
      }),
  );
})
const sent: Record<string, boolean> = {};
async function listenToNotification() {
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
    const date = new Date();
    const pad = (n: number, l = 2) => String(n).padStart(l, '0')
    const today = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    if (user && projects?.length) {
      firebaseService.streamWith<ILoggable>('logs', {
        'date >=': today,
        'project in': projects
      }).subscribe({
        next(logs) {
          logs.forEach(async log => {
            if (sent[log.key] || log.operator === user.uid) return;
            const opKey = typeof log.operator == 'object' ? log.operator.key : log.operator;
            const operator = await firebaseService.get('profiles', opKey) as (IProfile | undefined);
            await self.registration.showNotification('ASC:' + log.type, {
              body: operator?.name,
              icon: (location?.origin || '') + '/icons/asc-icon.png',
              badge: operator?.avatar,
              silent: false,
              data: log,
              tag: log.key
            });
            sent[log.key] = true;
          })
        },
      })
    } else {
      await self.registration.showNotification('ASC: No projects', {
        body: (user?.displayName || 'User') + ' has no project involvement',
        icon: (location?.origin || '') + '/icons/asc-icon.png',
        tag: 'no-projects:' + today,
        badge: user?.photoURL || undefined,
        vibrate: 1,
        silent: false,
      });

    }
  }
}
