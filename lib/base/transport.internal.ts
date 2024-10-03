export abstract class InternalTransport {
  public constructor(options: InternalTransportOptions) {
  }
}

export interface InternalTransportOptions {
  name: string;
  localPackage: string;
}
