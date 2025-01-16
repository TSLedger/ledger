import type { DispatchMessageContext } from './context.ts';

export interface BinderOption {
  jsr: `jsr:@${string}/${string}` | string;
}

export interface WorkerHandler {
  receive: ({ context }: DispatchMessageContext) => Promise<void>;
}
