import type { PageOptions } from '../../mod.ts';

export enum Level {
  TRACE,
  INFO,
  WARN,
  SEVERE,
}

/** Operation Codes for Workers. */
export enum Operation {
  SET_PACKAGE,
  INITIALIZED,
  HEARTBEAT,
  MESSAGE,
  ENSURE,
  ERROR,
}

/** */
export type JoinedWorkerContexts = PageHeartbeatContext | PageInitializedContext | PageSetPackageContext | PageMessageContext | WorkerErrorContext;

/** */
export interface PageEvent {
  op: Operation;
}

/** */
export interface PageSetPackageContext extends PageEvent {
  op: Operation.SET_PACKAGE;
  context: {
    options: PageOptions;
  };
}

/** */
export interface PageInitializedContext {
  op: Operation.INITIALIZED;
}

/** */
export interface PageHeartbeatContext {
  op: Operation.HEARTBEAT;
}

/** */
export interface PageMessageContext extends PageEvent {
  op: Operation.MESSAGE;
  context: {
    message: string;
    args: unknown[];
    date: Date;
    level: Level
  };
  ensureId?: string;
}

export interface WorkerErrorContext extends PageEvent {
  op: Operation.ERROR;
  context: {
    e: Error;
  };
}
