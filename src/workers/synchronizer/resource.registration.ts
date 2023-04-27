import { ceremonyResource, convoResource, discussionResource, iterationResource, profileResource, projectResource } from 'src/resources';
import resourceSynchronizer from './resource.synchronizer';
import { onlineUsersResource } from 'src/resources/online-users.resource';
import { logsResource } from 'src/resources/logs.resource';


resourceSynchronizer.register(onlineUsersResource, 'shared');
resourceSynchronizer.register(logsResource, 'shared');
resourceSynchronizer.register(profileResource, 'profiles');
resourceSynchronizer.register(projectResource, 'projects');
resourceSynchronizer.register(iterationResource, 'iterations');
resourceSynchronizer.register(discussionResource, 'discussions');
resourceSynchronizer.register(convoResource, 'convos');
resourceSynchronizer.register(ceremonyResource, 'ceremonies');

