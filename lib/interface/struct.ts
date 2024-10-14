import type { Level } from './level.ts';
import type { TransportOp } from './op.ts';

/** LedgerTransportOptions Base */
export interface LedgerTransportOptions {
  /** Enable Developer Mode for Local or HTTPs Imports of Transports. */
  developerMode?: boolean;
}

/** Base TransportMessage */
export interface TransportMessage {
  op: TransportOp;
}

/** Transport Message for {@link TransportOp.HANDLE}. */
export interface TransportHandleMessage extends TransportMessage {
  op: TransportOp.HANDLE;
  level: Level;
  date: Date;
  message: string;
  args: unknown[];
}

/**
 * Transport Message for {@link TransportOp.SET_PACKAGE}.
 * @internal
 */
export interface TransportSetPackageMessage extends TransportMessage {
  op: TransportOp.SET_PACKAGE;
  package: string;
  options: LedgerTransportOptions;
}

/**
 * Transport Message for {@link TransportOp.INTERNAL_ERROR}.
 * @internal
 */
export interface TransportInternalErrorMessage extends TransportMessage {
  op: TransportOp.INTERNAL_ERROR;
  message: string;
  stack: string;
  transportJsrPackage: string;
}
