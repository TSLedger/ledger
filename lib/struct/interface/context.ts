export interface MessageContext {
  operation: Operation;
  context: {
    jsr: `jsr:@${string}/${string}`;
  };
}

export enum Operation {
  CONFIGURE_WORKER,
  HEARTBEAT,
  MESSAGE,
  LEDGER_ERROR,
}
