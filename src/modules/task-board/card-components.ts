import cards from './cards';
import { PlanningItem } from 'src/entities';

type Component = any;
const componentMap: Record<PlanningItem['type'], string | Component> = {
    goal: cards.GoalCard,
    objective: cards.ObjectiveCard,
    story: cards.StoryCard,
    task: cards.TechnicalCard,
};
export function getComponent(item: PlanningItem) {
    if (typeof componentMap[item.type] == 'string') {
        return componentMap[item.type];
    } else {
        return componentMap[item.type];
    }
}
