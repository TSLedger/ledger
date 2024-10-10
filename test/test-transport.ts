import { LedgerTransportOptions, TransportMessage } from '../lib/interface/struct.ts';
import { LedgerTransport } from '../lib/transport.ts';

export class Transport extends LedgerTransport {
  public constructor(options: LedgerTransportOptions) {
    super(options);
  }

  public override async consume(payload: TransportMessage): Promise<void> {
    console.info(true);
  }
}
