import type { Level } from './level.ts';

/** Ledger Options. */
export interface LedgerOption {
  /** The dispatching Service Identifier. */
  service: string;

  /** Use the DispatchQueue of FIFO. False will post directly to Worker Threads immediately. */
  useAsyncDispatchQueue?: boolean;

  /** Troubleshooting Verbose Mode. */
  troubleshooting?: boolean;
  troubleshootingIPC?: boolean;
}

/**
 * Handler Options for Interfaces with the Service Option.
 *
 * @internal
 */
export interface ServiceHandlerOption {
  /** The fully qualified definition to import. Please include hashes or versions to ensure proper imports. */
  definition: string;

  /** The highest level of events to dispatch to the associated handler. All levels >= selected level will be dispatched. */
  level: Level;

  /** The dispatching Service Identifier. */
  service: string;

  /** Handler Options & IPC Troubleshooting. */
  troubleshooting?: boolean;
  troubleshootingIPC?: boolean;
}
