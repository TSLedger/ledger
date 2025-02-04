import type { DispatchMessageContext } from './context.ts';

/** Worker Handler Interface. Asserts the required structure of a Worker Handler. */
export interface WorkerHandler {
  receive: ({ context }: DispatchMessageContext) => Promise<void>;
}
