import { DiscussionItem } from 'src/entities';
import GoalSectionVue from './GoalSection.vue';
import TaskSectionVue from './TaskSection.vue';
import ObjectiveSectionVue from './ObjectiveSection.vue';
import StorySectionVue from './StorySection.vue';

export type DiscussionDetailsSection = {
  type: DiscussionItem['type']
  component: typeof GoalSectionVue
}

export const discussionDetailsSections: DiscussionDetailsSection[] = [{
  type: 'goal',
  component: GoalSectionVue
}, {
  type: 'task',
  component: TaskSectionVue
}, {
  type: 'objective',
  component: ObjectiveSectionVue
}, {
  type: 'story',
  component: StorySectionVue
}];
