import type { Level } from './level.ts';
import type { TransportOp } from './op.ts';

export interface LedgerTransportOptions {
  colorize?: boolean;
  developerMode?: boolean;
}

export interface TransportMessage {
  op: TransportOp;
}

export interface TransportSetPackageMessage extends TransportMessage {
  package: string;
  options: LedgerTransportOptions;
}

export interface TransportHandleMessage extends TransportMessage {
  level: Level;
  date: Date;
  message: string;
  args: unknown[];
}
