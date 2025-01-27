import type { DispatchMessageContext } from './context.ts';

export interface BinderOption {
  definition: string;
}

export interface WorkerHandler {
  receive: ({ context }: DispatchMessageContext) => Promise<void>;
}
