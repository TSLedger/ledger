import type { LedgerTransportOptions, TransportHandleMessage } from './interface/struct.ts';

/** Abstraction for Building Transports. */
export class LedgerTransport {
  protected options: LedgerTransportOptions;

  /**
   * Create a Ledger Transport.
   *
   * @param options The {@link LedgerTransportOptions}.
   */
  public constructor(options: LedgerTransportOptions) {
    this.options = options;
  }

  /**
   * Consumer for Transport Payloads. Must be overriden.
   *
   * @param payload The {@link TransportMessage} instance.
   *
   * @abstract
   */
  public async consume(payload: TransportHandleMessage): Promise<void> {
    throw new Error(`Method not implemented when handling consume for '${payload.op}'.`);
  }
}
