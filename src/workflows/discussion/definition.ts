import { DiscussionItem, IBoardColumn } from 'src/entities';
import { Struct } from 'src/structs';

export type Discussion =
  | Struct<'moveIssue', {
    issue: DiscussionItem,
    column?: IBoardColumn,
    iterationKey?: string,
    done?: (issue: DiscussionItem) => void
  }>
