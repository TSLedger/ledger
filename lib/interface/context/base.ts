import type { WorkerOptions } from '../option.ts';

/** Operation Codes for Workers. */
export enum Operation {
  HEARTBEAT,
  SET_PACKAGE,
  MESSAGE,
  ENSURE,
  ERROR,
}

export type JoinedWorkerContexts = WorkerSetPackageContext | WorkerMessageContext;

/** */
export interface WorkerEvent {
  op: Operation;
}

export interface WorkerSet

export interface WorkerSetPackageContext extends WorkerEvent {
  op: Operation.SET_PACKAGE;
  context: {
    options: WorkerOptions;
  };
}

export interface WorkerMessageContext extends WorkerEvent {
  op: Operation.MESSAGE;
  context: {
    base: string;
  };
}
