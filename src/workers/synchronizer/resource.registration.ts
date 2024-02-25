import { ceremonyResource, convoResource, discussionResource, iterationResource, profileResource, projectResource } from 'src/resources';
import resourceSynchronizer from './resource.synchronizer';
import { onlineUsersResource } from 'src/resources/online-users.resource';
import { logResource } from 'src/resources/log.resource';
import { logCounterResource } from 'src/resources/log-counter.resource';

resourceSynchronizer.register(onlineUsersResource, 'shared');
resourceSynchronizer.register(logResource, 'shared');
resourceSynchronizer.register(logCounterResource, 'shared');
resourceSynchronizer.register(profileResource, 'profiles');
resourceSynchronizer.register(projectResource, 'projects');
resourceSynchronizer.register(iterationResource, 'iterations');
resourceSynchronizer.register(discussionResource, 'discussions');
resourceSynchronizer.register(convoResource, 'convos');
resourceSynchronizer.register(ceremonyResource, 'ceremonies');

