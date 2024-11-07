import type { Level } from './level.if.ts';
import type { Op } from './operation.if.ts';
import type {PageConfigurationOptions} from './page.if.ts';

/** */
export type JoinedWorkerContexts = PageHeartbeatContext | PageSendConfigurationContext | PageInitializedContext | PageMessageContext | WorkerErrorContext;

/** */
export interface PageEvent {
  op: Op;
}

/** */
export interface PageSendConfigurationContext extends PageEvent {
  op: Op.SEND_CONFIGURATION;
  context: {
    options: PageConfigurationOptions;
  };
}

/** */
export interface PageInitializedContext {
  op: Op.INITIALIZED;
}

/** */
export interface PageHeartbeatContext {
  op: Op.HEARTBEAT;
}

/** */
export interface PageMessageContext extends PageEvent {
  op: Op.MESSAGE;
  context: {
    message: string;
    args: unknown[];
    date: Date;
    level: Level
  };
}

export interface WorkerErrorContext extends PageEvent {
  op: Op.ERROR;
  context: {
    e: Error;
  };
}
