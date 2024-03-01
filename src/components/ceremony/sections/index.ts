import { ICeremony } from 'src/entities';
import PlanningSectionVue from './PlanningSection.vue';

export type CeremonyDetailsSection = {
  type: ICeremony['type']
  component: typeof PlanningSectionVue
}

export const ceremonyDetailsSections: CeremonyDetailsSection[] = [{
  type: 'planning',
  component: PlanningSectionVue
}];
