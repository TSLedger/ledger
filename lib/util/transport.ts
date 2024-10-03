import type { ExternalTransport, ExternalTransportOptions } from '../base/transport.external.ts';
import type { InternalTransport, InternalTransportOptions } from '../base/transport.internal.ts';

export class TransportLoader {
  public static async getInternalTransporter(options: InternalTransportOptions): Promise<InternalTransport> {
    const { Transport } =
  }

  public static async getExternalTransport(options: ExternalTransportOptions): Promise<ExternalTransport> {
    const { Transport } = await import(options.jsrPackage) as { Transport: ExternalTransport };
  }
}

enum Transports = {
  JSON =
}
