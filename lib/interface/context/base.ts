import type { TransportOptions, WorkerOptions } from '../option.ts';

/** Operation Codes for Workers. */
export enum Operation {
  SET_PACKAGE,
  MESSAGE,
  ENSURE,
  ERROR,
}

export type EventContexts = WorkerSetPackageContext | WorkerMessageContext;

/** */
export interface WorkerEvent {
  op: Operation;
}

interface WorkerSetPackageContext extends WorkerEvent {
  op: Operation.SET_PACKAGE;
  context: {
    workerOptions: WorkerOptions;
    transportOptions: TransportOptions;
  };
}

interface WorkerMessageContext extends WorkerEvent {
  op: Operation.MESSAGE;
  context: {
    base: string;
  };
}
