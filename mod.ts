import { Binder } from './lib/binder.ts';
import type { BinderOption, LedgerOption } from './lib/struct/interface/options.ts';
import { IntervalManager } from './lib/util/interval.ts';

export class Ledger {
  private options: LedgerOption;
  private readonly binders: Map<string, Binder> = new Map();
  private readonly restart = new IntervalManager();

  public constructor(options: LedgerOption) {
    this.restart.start(() => {
      this.binders.entries().filter(([_, v]) => !v.isAlive && v.wasAlive).forEach(([k, v]) => {
        v.terminate();
        this.binders.set(crypto.randomUUID(), new Binder(v.options));
        this.binders.delete(k);
      });
    }, 100);
  }

  public register(options: BinderOption): Ledger {
    this.binders.set(crypto.randomUUID(), new Binder(options));
    return this;
  }

  public terminate(): void {
    this.restart.stop();
    this.binders.forEach((binder) => {
      binder.terminate();
    });
  }
}
