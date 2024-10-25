/** Operation Codes for Workers. */
export enum Operation {
  HEARTBEAT,
  INITIALIZED,
  SET_PACKAGE,
  MESSAGE,
  ENSURE,
  EXCEPT,
}

/** */
export type JoinedWorkerContexts = WorkerHeartbeatContext | WorkerInitializedContext | WorkerSetPackageContext | WorkerMessageContext | WorkerErrorContext;

/** */
export interface WorkerEvent {
  op: Operation;
}

/** */
export interface WorkerHeartbeatContext {
  op: Operation.HEARTBEAT;
}

/** */
export interface WorkerInitializedContext {
  op: Operation.INITIALIZED;
}

/** */
export interface WorkerSetPackageContext extends WorkerEvent {
  op: Operation.SET_PACKAGE;
  context: {
    options: null;
  };
}

/** */
export interface WorkerMessageContext extends WorkerEvent {
  op: Operation.MESSAGE;
  context: {
    base: string;
  };
}

export interface WorkerErrorContext extends WorkerEvent {
  op: Operation.EXCEPT;
  context: {
    e: Error;
  };
}
