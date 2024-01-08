import { DiscussionItem, IBoardColumn, IProfile } from 'src/entities';
import { Struct } from 'src/structs';
export enum TaskActionError {
  notReady,
  alreadyClosed,
  notMoveable
}
export type Discussion =
  | Struct<'moveIssue', {
    issue: DiscussionItem,
    column?: IBoardColumn,
    iterationKey?: string,
    done?: (issue: DiscussionItem) => void
    error?: (error: TaskActionError) => void;
  }>
  | Struct<'assignTask', {
    issue: DiscussionItem,
    profile: IProfile,
    done?: (issue: DiscussionItem) => void
  }>
  | Struct<'createDiscussion', {
    item: DiscussionItem,
    refItem?: DiscussionItem,
    projectKey: string;
    iterationKey: string;
    done?: (item: DiscussionItem) => void
  }>
  | Struct<'assessDiscussion', {
    item: DiscussionItem,
    done?: (item: DiscussionItem) => void
  }>
