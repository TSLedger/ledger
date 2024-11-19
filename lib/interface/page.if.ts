import type { PageMessageContext } from '../../mod.ts';

export interface PageHandler {
  receive: ({ context }: PageMessageContext) => Promise<void>;
}

/** Options for a Page Instance. */
export interface PageOptions {
  package: string;
  options: unknown;
}
