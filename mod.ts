import { interval } from './deps.ts';
import { Binder } from './lib/binder.ts';
import type { BinderOption } from './lib/struct/interface/options.ts';

// Original: Pen

export class Ledger {
  private readonly state: AbortController = new AbortController();
  private readonly binders: Map<string, Binder> = new Map();

  public constructor() {
    this.restore();
  }

  public async register(options: BinderOption): Promise<Ledger> {
    this.binders.set(crypto.randomUUID(), new Binder(options));
    return this;
  }

  public terminate(): void {
    this.state.abort();
    this.binders.forEach((binder) => {
      binder.terminate();
    });
  }

  private async restore(): Promise<void> {
    for await (
      const _ of interval(
        () => {
        },
        100,
        this.state,
      )
    ) {
      if (this.state.signal.aborted) break;
    }
  }
}
