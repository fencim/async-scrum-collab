export type ActionItem = {
  key: string;
  title: string;
  caption: string;
  icon: string;
  link?: string;
  active?: boolean;
  hide?: boolean;
  emphasize?: boolean;
};

export const ticketActionList: ActionItem[] = [
  {
    key: 'view',
    title: 'View Ticket',
    caption: 'View Details',
    icon: 'info',
  },
  {
    key: 'convo',
    title: 'Conversation',
    caption: 'Activity',
    icon: 'chat',
    link: '',
  },
  {
    key: 'vote',
    title: 'Vote',
    caption: 'Vote Story Point',
    icon: 'poll',
    link: '',
  },
  {
    key: 'confidence',
    title: 'Vote',
    caption: 'Vote for Confidence Vote',
    icon: 'how_to_vote',
    link: '',
  },
  {
    key: 'attachment',
    title: 'Attachments',
    caption: 'Download',
    icon: 'attachment',
    link: '',
  },
  {
    key: 'record',
    title: 'Record Audio',
    caption: 'send recoded message',
    icon: 'mic',
    link: '',
  },
  {
    key: 'question',
    title: 'Raise Concern',
    caption: 'Raise Concern',
    icon: 'question_mark',
    link: '',
  },
  {
    key: 'agree',
    title: 'Agree',
    caption: 'Agree on Ticket readiness',
    icon: 'thumb_up_alt',
    link: '',
  },
  {
    key: 'disagree',
    title: 'Disagree',
    caption: 'Disagree on Ticket readiness',
    icon: 'thumb_down_alt',
    link: '',
  },
  {
    key: 'presentation',
    title: 'Presentation',
    caption: 'Play Presentation',
    icon: 'smart_display',
    link: '',
  },
];
