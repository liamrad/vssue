import { Plugin as PluginObject, DefineComponent } from 'vue';
import type { ComputedRef } from 'vue'
import 'vue-i18n';
import type { VssueAPI } from './api';

export namespace Vssue {
  export type Options = {
    api: VssueAPI.Constructor;
    owner: string;
    repo: string;
    clientId: string;
    clientSecret: string;
    baseURL: string;
    state: string;
    labels: Array<string>;
    prefix: string;
    admins: Array<string>;
    perPage: number;
    locale: string;
    proxy: string | ((url: string) => string);
    issueContent: (param: {
      options: Vssue.Options;
      url: string;
    }) => string | Promise<string>;
    autoCreateIssue: boolean;
  };

  export interface Plugin extends PluginObject {
    readonly version: string;
    installed: boolean;
    VssueComponent: Vssue.Component;
  }

  export type Component = typeof DefineComponent;

  export interface Store extends DefineComponent {
    version: ComputedRef<string>;
    title: string | ((options: Vssue.Options) => string);
    issueTitle: ComputedRef<string>;
    issueId: number | string;
    options: Vssue.Options | null;
    API: VssueAPI.Instance | null;
    accessToken: string | null;
    user: VssueAPI.User | null;
    issue: VssueAPI.Issue | null;
    comments: VssueAPI.Comments | null;
    query: VssueAPI.Query;
    isInitializing: boolean;
    isIssueNotCreated: boolean;
    isLoginRequired: boolean;
    isFailed: boolean;
    isCreatingIssue: boolean;
    isLoadingComments: boolean;
    isCreatingComment: boolean;
    isUpdatingComment: boolean;
    isLogined: ComputedRef<boolean>;
    isAdmin: ComputedRef<boolean>;
    isPending: ComputedRef<boolean>;
    setOptions(options: Partial<Vssue.Options>): void;
    init(): Promise<void>;
    postIssue(): Promise<VssueAPI.Issue | void>;
    getComments(): Promise<VssueAPI.Comments | void>;
    postComment(options: { content: string }): Promise<VssueAPI.Comment | void>;
    deleteComment(options: {
      commentId: number | string;
    }): Promise<boolean | void>;
    putComment(options: {
      commentId: number | string;
      content: string;
    }): Promise<VssueAPI.Comment | void>;
    getCommentReactions(options: {
      commentId: number | string;
    }): Promise<VssueAPI.Reactions | void>;
    postCommentReaction(options: {
      commentId: number | string;
      reaction: keyof VssueAPI.Reactions;
    }): Promise<boolean | void>;
    login(): void;
    logout(): void;
  }
}

export default Vssue;
