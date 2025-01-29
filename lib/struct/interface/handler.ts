import type { DispatchMessageContext } from './context.ts';

export interface WorkerHandler {
  receive: ({ context }: DispatchMessageContext) => Promise<void>;
}
