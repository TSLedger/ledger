import type { ExternalTransport, ExternalTransportOptions } from '../base/transport.external.ts';
import type { InternalTransport, InternalTransportOptions } from '../base/transport.internal.ts';
import { ConsoleTransport } from '../transport/console.ts';

export class TransportLoader {
  public static async getInternalTransporter(internal: TransportsType, options: InternalTransportOptions): Promise<InternalTransport> {
    const { Transport } = Transports[internal];
    return new Transport(options);
  }

  public static async getExternalTransporter(options: ExternalTransportOptions): Promise<ExternalTransport> {
    const { Transport } = await import(options.package) as { Transport: typeof ExternalTransport };
    return new Transport(options);
  }
}

const Transports = {
  CONSOLE: { Transport: ConsoleTransport },
};
export type TransportsType = keyof typeof Transports;
