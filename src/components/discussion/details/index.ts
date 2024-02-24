import { DiscussionItem } from 'src/entities';
import StoryAcceptanceTab from './StoryAcceptanceTab.vue';
import StorySubTasksTab from './StorySubTasksTab.vue';
import ScrumReportTasksDidTab from './ScrumReportTasksDidTab.vue';
import ScrumReportTodoTasksTabVue from './ScrumReportTodoTasksTab.vue';
import ScrumReportRoadblocksTabVue from './ScrumReportRoadblocksTab.vue';

export type DiscussionDetailsTab = {
  name: string;
  label: string;
  icon?: string;
  type: DiscussionItem['type']
  component: typeof StoryAcceptanceTab
}

export const discussionDetailsTabs: DiscussionDetailsTab[] = [{
  name: 'acceptance',
  type: 'story',
  label: 'Acceptance',
  component: StoryAcceptanceTab
}, {
  name: 'subtasks',
  type: 'story',
  label: 'Subtasks',
  component: StorySubTasksTab
}, {
  name: 'tasksDid',
  type: 'scrum',
  label: 'Tasks Did',
  component: ScrumReportTasksDidTab,
}, {
  name: 'todoTasks',
  type: 'scrum',
  label: 'Todo Tasks',
  component: ScrumReportTodoTasksTabVue,
}, {
  name: 'roadblocks',
  type: 'scrum',
  label: 'Roadblocks',
  component: ScrumReportRoadblocksTabVue,
}];
