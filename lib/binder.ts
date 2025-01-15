import { Queue } from '../deps.ts';
import type { MessageContext } from './struct/interface/context.ts';
import type { BinderOption } from './struct/interface/options.ts';

export class Binder extends Worker {
  public readonly options: BinderOption;

  public readonly queue: Queue<MessageContext> = new Queue();
  public readonly state: AbortController = new AbortController();

  /**
   * Initialize a Worker with {@link BinderOption}.
   *
   * @param options The {@link BinderOption} to initialize.
   */
  public constructor(options: BinderOption) {
    super(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.options = options;
  }
}
