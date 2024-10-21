import type { WorkerOptions } from '../option.ts';

/** Operation Codes for Workers. */
export enum Operation {
  HEARTBEAT,
  SET_PACKAGE,
  MESSAGE,
  ENSURE,
  ERROR,
}

/** */
export type JoinedWorkerContexts = WorkerHeartbeatContext | WorkerSetPackageContext | WorkerMessageContext;

/** */
export interface WorkerEvent {
  op: Operation;
}

/** */
export interface WorkerHeartbeatContext {
  op: Operation.HEARTBEAT;
}

/** */
export interface WorkerSetPackageContext extends WorkerEvent {
  op: Operation.SET_PACKAGE;
  context: {
    options: WorkerOptions;
  };
}

/** */
export interface WorkerMessageContext extends WorkerEvent {
  op: Operation.MESSAGE;
  context: {
    base: string;
  };
}
