import type { DispatchMessageContext } from '../struct/export.ts';
import type { WorkerHandler } from '../struct/interface/handler.ts';

export class Handler implements WorkerHandler {
  // deno-lint-ignore require-await
  public async receive({ context }: DispatchMessageContext): Promise<void> {
    // deno-lint-ignore no-console
    console.info('test-success', context.level, context.q);
  }
}
