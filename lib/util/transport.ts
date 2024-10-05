import type { InternalTransport, InternalTransportOptions } from '../base/transport.internal.ts';
import { ConsoleTransport } from '../transport/console.ts';
// import type { ExternalTransport, ExternalTransportOptions } from '../base/transport.external.ts';

export class TransportLoader {
  public static async getInternalTransporter(internal: keyof typeof Transports, options: InternalTransportOptions): Promise<InternalTransport> {
    const { Transport } = Transports[internal];
    return new Transport(options);
  }

  // public static async getExternalTransport(options: ExternalTransportOptions): Promise<ExternalTransport> {
  //   const { Transport } = await import(options.jsrPackage) as { Transport: ExternalTransport };
  // }
}

const Transports = {
  CONSOLE: { Transport: ConsoleTransport },
};
