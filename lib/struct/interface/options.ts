/** Ledger Options. */
export interface LedgerOption {
  /** The dispatching Service Identifier. */
  service: string;

  /** Use the DispatchQueue of FIFO. False will post directly to Worker Threads immediately. */
  useAsyncDispatchQueue?: boolean;
}

/** Handler Options. */
export interface HandlerOption {
  /** The fully qualified definition to import. Please include hashes or versions to ensure proper imports. */
  definition: string;
}

/**
 * Handler Options for Interfaces with the Service Option.
 *
 * @internal
 */
export interface ServiceHandlerOption extends HandlerOption {
  /** The dispatching Service Identifier. */
  service: string;
}
