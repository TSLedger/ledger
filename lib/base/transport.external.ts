export abstract class ExternalTransport {
  public constructor(options: ExternalTransportOptions) {
  }
}

export interface ExternalTransportOptions {
  name: string;
  jsrPackage: string;
}
