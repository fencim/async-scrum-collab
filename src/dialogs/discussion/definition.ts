import { DiscussionItem, IIteration } from 'src/entities';
import { Struct } from 'src/structs';

export type Discussions =
  | Struct<'newTask', {
    status?: DiscussionItem['status'],
    type?: DiscussionItem['type'],
    iteration?: IIteration,
    done?: (item: DiscussionItem) => void,
    error?: ErrorCallback;
  }>
  | Struct<'editTask', {
    item: DiscussionItem,
    done?: (item: DiscussionItem) => void,
    error?: ErrorCallback;
  }>
  | Struct<'newSubTask', {
    ref: DiscussionItem,
    done?: (item: DiscussionItem) => void,
    error?: ErrorCallback;
  }>
  | Struct<'viewTask', DiscussionItem>
  | Struct<'voteForItemComplexity', {
    item: DiscussionItem,
    done?: () => void
    error?: (error: unknown) => void;
  }>
  | Struct<'agreeOnItemReadiness', {
    item: DiscussionItem,
    done?: (item: DiscussionItem) => void
    error?: ErrorCallback;
  }>
  | Struct<'disagreeOnItemReadiness', {
    item: DiscussionItem,
    done?: (item: DiscussionItem) => void
    error?: ErrorCallback;
  }>
  | Struct<'playSprintPresentation', {
    iteration: IIteration,
    done?: VoidCallback;
    error?: ErrorCallback;
  }>;
