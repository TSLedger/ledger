export interface LedgerOption {
  /** Use the DispatchQueue of FIFO. False will post directly to Worker Threads immediately. */
  useAsyncDispatchQueue?: boolean;
}

export interface BinderOption {
  /** The fully qualified definition to import. Please include hashes or versions to ensure proper imports. */
  definition: string;
}
