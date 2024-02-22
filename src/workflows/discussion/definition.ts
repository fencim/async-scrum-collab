import { Convo, DiscussionItem, DiscussionReport, IBoardColumn, IProfile, IQuestion, IResponse } from 'src/entities';
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
    done?: (report?: DiscussionReport[]) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'voteForComplexity', {
    item: DiscussionItem,
    vote: string;
    voter: string;
    done?: (item: DiscussionItem) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'askQuestion', {
    item: DiscussionItem,
    message: string,
    done?: (message: IQuestion) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'confirmDisagreement', {
    item: DiscussionItem,
    message: string,
    done?: (message: IQuestion) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'replyToMessage', {
    item: DiscussionItem,
    message: string,
    ref: Convo,
    done?: (message: Convo) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'resolveQuestionOf', {
    item: DiscussionItem,
    message: IResponse,
    resolution: 'agree' | 'disagree'
    done?: (message: IResponse) => void
    error?: (error: unknown) => void;
  }>

