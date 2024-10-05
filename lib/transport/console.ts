import { InternalTransport, type InternalTransportOptions } from '../base/transport.internal.ts';

export class ConsoleTransport extends InternalTransport {
  public constructor(options: ConsoleTransportOptions) {
    super(options);
  }
}

export interface ConsoleTransportOptions extends InternalTransportOptions {
}
