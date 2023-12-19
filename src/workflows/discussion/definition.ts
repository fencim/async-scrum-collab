import { DiscussionItem, IBoardColumn, IProfile } from 'src/entities';
import { Struct } from 'src/structs';

export type Discussion =
  | Struct<'moveIssue', {
    issue: DiscussionItem,
    column?: IBoardColumn,
    iterationKey?: string,
    done?: (issue: DiscussionItem) => void
  }>
  | Struct<'assignTask', {
    issue: DiscussionItem,
    profile: IProfile,
    done?: (issue: DiscussionItem) => void
  }>
