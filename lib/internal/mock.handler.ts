import type { DispatchMessageContext } from '../struct/export.ts';
import type { WorkerHandler } from '../struct/interface/handler.ts';
import type { ServiceHandlerOption } from '../struct/interface/options.ts';

export class Handler implements WorkerHandler {
  private readonly options: ServiceHandlerOption;

  public constructor(options: ServiceHandlerOption) {
    this.options = options;
  }

  // deno-lint-ignore require-await
  public async receive({ context }: DispatchMessageContext): Promise<void> {
    // deno-lint-ignore no-console
    console.info(
      Deno.inspect({
        state: 'test-info',
        context: context,
        options: this.options,
      }),
    );
    // deno-lint-ignore no-console
    console.error(
      Deno.inspect({
        state: 'test-error',
        context: context,
        options: this.options,
      }),
    );
  }
}
