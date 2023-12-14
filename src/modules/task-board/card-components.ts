import cards from './cards';
import { DiscussionItem } from 'src/entities';

type Component = typeof cards.StoryCard;
const componentMap: Record<DiscussionItem['type'], string | Component> = {
  goal: cards.GoalCard,
  objective: cards.ObjectiveCard,
  story: cards.StoryCard,
  task: cards.TechnicalCard,
  'went-well': cards.TechnicalCard,
  'went-wrong': cards.TechnicalCard,
  'to-improve': cards.TechnicalCard,
  'action-item': cards.TechnicalCard,
  demo: cards.TechnicalCard,
  report: cards.TechnicalCard,
  roadblock: cards.TechnicalCard,
  scrum: cards.TechnicalCard,
};
export function getComponent(item: DiscussionItem) {
  if (typeof componentMap[item.type] == 'string') {
    return componentMap[item.type];
  } else {
    return componentMap[item.type];
  }
}
