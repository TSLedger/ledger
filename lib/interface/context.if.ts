import type { Level } from './level.if.ts';
import type { Op } from './operation.if.ts';

/** The Joined Contexts for Case Statement. */
export type PageAllContexts = PageHeartbeatContext | PageSendConfigurationContext | PageMessageContext | WorkerErrorContext;

/** The Base Context Event.*/
export interface BaseContext {
  op: Op;
}

/** Context for Sent Configuration. */
export interface PageSendConfigurationContext extends BaseContext {
  op: Op.SEND_CONFIGURATION;
  context: {
    package: string;
    options: unknown;
  };
}

/** Context for Heartbeats. */
export interface PageHeartbeatContext {
  op: Op.HEARTBEAT;
}

/** Context for Messages. */
export interface PageMessageContext extends BaseContext {
  op: Op.MESSAGE;
  context: {
    message: string;
    args: unknown[];
    date: Date;
    level: Level;
  };
}

/** Context for Worker Errors. */
export interface WorkerErrorContext extends BaseContext {
  op: Op.ERROR;
  context: {
    e: Error;
  };
}
