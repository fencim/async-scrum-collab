import { DiscussionItem, IIteration } from 'src/entities';
import { Struct } from 'src/structs';

export type Discussions =
  | Struct<'newTask', {
    status?: DiscussionItem['status'],
    type?: DiscussionItem['type'],
    iteration?: IIteration,
    done?: (item: DiscussionItem) => void
  }>
  | Struct<'editTask', {
    item: DiscussionItem,
    done?: (item: DiscussionItem) => void
  }>
  | Struct<'newSubTask', {
    ref: DiscussionItem,
    done?: (item: DiscussionItem) => void
  }>
  | Struct<'viewTask', DiscussionItem>
