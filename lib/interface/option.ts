export interface LedgerOptions {
  /** Transport List */
  workers: WorkerOptions[];

  /** Control the respawn limitations. */
  respawn?: {
    /** The maximum number of restarts for an individual worker. */
    limit: number;
    /** The rolling window in ms to decrement the respawn counter. */
    ms: number;
  };
}

export interface WorkerOptions {
  /** Set the Worker Loading Mode. */
  mode: 'jsr.io' | 'alternative';
  /** Associated {@link TransportOptions}. */
  opts: TransportOptions;
  /**
   * The package to initialize. Approved JSR Types listed, but any string is allowed.
   *
   * Mode must be 'disk' to allow alternative packages.
   */
  // deno-lint-ignore ban-types
  package: ApprovedWorkers | string & {};
}

export interface TransportOptions {
  /** Control the processing thread. */
  queue?: {
    /** The number of events to process concurrently. */
    threadCount: number;
  };
}

/** List of Approved Workers. Official or Approved Workers List for Auto Indexing. */
export type ApprovedWorkers =
  | '@ledger/console-transport'
  | '@ledger/file-transport';
