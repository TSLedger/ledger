import type { LedgerTransportOptions, TransportHandleMessage } from '../../lib/interface/struct.ts';
import { LedgerTransport } from '../../lib/transport.ts';

export class Transport extends LedgerTransport {
  public constructor(options: LedgerTransportOptions) {
    super(options);
  }

  // deno-lint-ignore require-await
  public override async consume(payload: TransportHandleMessage): Promise<void> {
    // deno-lint-ignore no-console
    console.info('consume', payload.op, payload.message);
  }
}
