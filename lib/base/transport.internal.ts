export abstract class InternalTransport {
  public constructor(options: InternalTransportOptions) {
  }

  public abstract consume(): Promise<void>;
}

export interface InternalTransportOptions {
}
