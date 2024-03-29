import { Convo, DiscussionItem, DiscussionReport, IBoardColumn, ICeremony, IProfile, IQuestion, IResponse, IRetroFeedback, IReviewCeremony } from 'src/entities';
import { Struct } from 'src/structs';
export enum TaskActionError {
  notReady,
  alreadyClosed,
  notMoveable
}
export type Discussion =
  | Struct<'moveIssue', {
    item: DiscussionItem,
    column?: IBoardColumn,
    iterationKey?: string,
    done?: (issue: DiscussionItem) => void
    error?: (error: TaskActionError) => void;
  }>
  | Struct<'deleteIssue', {
    item: DiscussionItem,
    done?: VoidCallback;
    error?: ErrorCallback;
  }>
  | Struct<'assignTask', {
    item: DiscussionItem,
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
  | Struct<'confirmAgreement', {
    item: DiscussionItem,
    message: string,
    reaction: 'agree' | 'disagree',
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
  | Struct<'retroFeedback', {
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
  | Struct<'mergeFeedbackWith', {
    item: DiscussionItem | ICeremony,
    message: IRetroFeedback,
    withMsg: string
    done?: (message: IRetroFeedback) => void
    error?: (error: unknown) => void;
  }>
  | Struct<'updateDiscussionFields', {
    item: DiscussionItem,
    done?: (discussion: DiscussionItem) => void;
    error?: ErrorCallback;
  }>

