import whatIsScrum from 'src/guides/what-is-scrum.guide.md?raw';
import agileManifesto from 'src/guides/agile-manifesto.guide.md?raw';
import coreValue1 from 'src/guides/manifesto/core-value-individual.guide.md?raw';
import coreValue2 from 'src/guides/manifesto/core-value-working-software.guide.md?raw';
import coreValue3 from 'src/guides/manifesto/core-value-customer-collab.guide.md?raw';
import coreValue4 from 'src/guides/manifesto/core-value-responding-to-change.guide.md?raw';

export type GuideItem = {
  label: string;
  key: string;
  icon?: string;
  content: string;
  keywords: string[];
  children?: GuideItem[];
};

export const guideTree: GuideItem[] = ([
  {
    key: 'agile-manifesto',
    label: 'Agile Manifesto',
    keywords: ['agile', 'manifesto'],
    content: agileManifesto,
    children: [
      {
        key: 'core-values',
        label: 'Agile Core Values',
        content: '',
        keywords: ['core values'],
        children: [
          {
            key: 'individuals & interactions',
            label: 'Individuals and Interactions Over Processes and Tools',
            content: coreValue1,
            keywords: ['individuals', 'interactions'],
          },
          {
            key: 'working software',
            label: 'Working Software Over Comprehensive Documentation',
            content: coreValue2,
            keywords: ['working', 'software', 'documentation'],
          },
          {
            key: 'customer collaboration',
            label: 'Customer Collaboration Over Contract Negotiation',
            content: coreValue3,
            keywords: ['customer', 'collaboration', 'negotiation'],
          },
          {
            key: 'responding to change',
            label: 'Responding to Change Over Following the plan',
            content: coreValue4,
            keywords: ['customer', 'collaboration', 'negotiation'],
          },
        ],
      },
    ],
  },
  {
    key: 'scrum',
    label: 'Scurm Framework',
    keywords: ['agile'],
    content: agileManifesto,
    children: [
      {
        label: 'What is Scrum?',
        key: 'what-is-scrum',
        keywords: ['agile', 'framework'],
        content: whatIsScrum,
      },
    ],
  },
]);
