import type { Level } from './level.ts';

export type IndexedMessageContexts = ConfigureWorkerMessageContext | AliveMessageContext | DispatchMessageContext | LedgerErrorMessageContext;

export interface ConfigureWorkerMessageContext extends MessageContext {
  operation: Operation.CONFIGURE_WORKER;
  context: {
    definition: string;
  };
}

export interface AliveMessageContext extends MessageContext {
  operation: Operation.ALIVE;
}

export interface DispatchMessageContext extends MessageContext {
  operation: Operation.DISPATCH;
  context: DispatchMessageContextPassthrough & {
    date: Date;
    level: Level;
  };
}

export interface DispatchMessageContextPassthrough {
  q?: string | Error | undefined;
  args?: unknown[] | undefined;
}

export interface LedgerErrorMessageContext extends MessageContext {
  operation: Operation.LEDGER_ERROR;
  context: {
    message: string;
    stack: string;
  };
}

export interface MessageContext {
  operation: Operation;
}

export enum Operation {
  CONFIGURE_WORKER,
  ALIVE,
  DISPATCH,
  LEDGER_ERROR,
}
