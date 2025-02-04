import type { Level } from './level.ts';

/** The Indexed Type for MessageContexts. */
export type IndexedMessageContexts = ConfigureWorkerMessageContext | AliveMessageContext | DispatchMessageContext | LedgerErrorMessageContext;

/** Configuration Payload. */
export interface ConfigureWorkerMessageContext extends MessageContext {
  operation: Operation.CONFIGURE_WORKER;
  context: {
    definition: string;
  };
}

/** Alive Payload. */
export interface AliveMessageContext extends MessageContext {
  operation: Operation.ALIVE;
}

/** Dispatch Payload. */
export interface DispatchMessageContext extends MessageContext {
  operation: Operation.DISPATCH;
  context: DispatchMessageContextPassthrough & {
    date: Date;
    level: Level;
  };
}

/** Dispatch Passthrough Extended Payload. */
export interface DispatchMessageContextPassthrough {
  q?: string | Error | undefined;
  args?: unknown[] | undefined;
}

/** Ledger Error Payload. */
export interface LedgerErrorMessageContext extends MessageContext {
  operation: Operation.LEDGER_ERROR;
  context: {
    message: string;
    stack: string;
  };
}

/** Message Context. */
export interface MessageContext {
  operation: Operation;
}

/** Operation Enum. */
export enum Operation {
  CONFIGURE_WORKER,
  ALIVE,
  DISPATCH,
  LEDGER_ERROR,
}
