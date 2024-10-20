import type { WorkerMessageContext } from './interface/context/base.ts';
import type { TransportOptions } from './interface/option.ts';

/** Abstraction for Building Transports. */
export class LedgerTransport {
  protected options: TransportOptions;

  /**
   * Create a Ledger Transport.
   *
   * @param options The {@link LedgerTransportOptions}.
   */
  public constructor(options: TransportOptions) {
    this.options = options;
  }

  /**
   * Consumer for Transport Payloads. Must be overriden.
   *
   * @param payload The {@link TransportMessage} instance.
   *
   * @abstract
   */
  // deno-lint-ignore require-await
  public async consume(payload: WorkerMessageContext): Promise<void> {
    throw new Error(`Method not implemented when handling consume for '${payload.op}'. This transport is incomplete.`);
  }
}
