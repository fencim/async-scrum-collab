import { Convo, DiscussionItem, DiscussionReport, IBoardColumn, ICeremony, IProfile, IQuestion, IResponse, IReviewCeremony } from 'src/entities';
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
    done?: (issue: DiscussionItem) => void;
    error?: ErrorCallback;
  }>
  | Struct<'createDiscussion', {
    item: DiscussionItem,
    refItem?: DiscussionItem,
    projectKey: string;
    iterationKey: string;
    done?: (item: DiscussionItem) => void
    error?: ErrorCallback;
  }>
  | Struct<'assessDiscussion', {
    item: DiscussionItem,
    done?: (report?: DiscussionReport[]) => void
    error?: ErrorCallback;
  }>
  | Struct<'assessCeremony', {
    ceremony: ICeremony,
    done?: (report?: DiscussionReport[]) => void
    error?: ErrorCallback;
  }>
  | Struct<'acceptSprintResult', {
    review: IReviewCeremony,
    completed: number;
    missed: number;
    done?: (review: IReviewCeremony) => void
    error?: ErrorCallback;
  }>
  | Struct<'voteForComplexity', {
    item: DiscussionItem,
    vote: string;
    voter: string;
    done?: (item: DiscussionItem) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'voteForConfidence', {
    ceremony: ICeremony,
    vote: string;
    voter: string;
    done?: (item: ICeremony) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'resetConfidenceVoting', {
    ceremony: ICeremony,
    moderator: string;
    done?: (item: ICeremony) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'askQuestion', {
    item: DiscussionItem | ICeremony,
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
  | Struct<'sendMessage', {
    discussion: string,
    iteration: string,
    message: string,
    done?: (message: Convo) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'replyToMessage', {
    item: DiscussionItem | ICeremony,
    message: string,
    ref: Convo,
    done?: (message: Convo) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'resolveQuestionOf', {
    item: DiscussionItem | ICeremony,
    message: IResponse,
    resolution: 'agree' | 'disagree'
    done?: (message: IResponse) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'updateDiscussionFields', {
    payload: DiscussionItem,
    done?: (discussion: DiscussionItem) => void;
    error?: ErrorCallback;
  }>

