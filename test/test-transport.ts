import { LedgerTransportOptions, TransportHandleMessage } from '../lib/interface/struct.ts';
import { LedgerTransport } from '../lib/transport.ts';

export class Transport extends LedgerTransport {
  public constructor(options: LedgerTransportOptions) {
    super(options);
  }

  public override async consume(payload: TransportHandleMessage): Promise<void> {
    console.info('consume event trigger', payload.op, payload.message);
  }
}
