export class ExternalTransport {
  public constructor(options: ExternalTransportOptions) {
  }
}

export interface ExternalTransportOptions {
  name: string;
  package: string;
}
