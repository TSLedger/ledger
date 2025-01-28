import { Binder } from './lib/binder.ts';
import { IndexedMessageContexts } from './lib/struct/interface/context.ts';
import type { BinderOption } from './lib/struct/interface/options.ts';
import { IntervalManager } from './lib/util/interval.ts';

export class Ledger {
  private readonly binders: Map<string, Binder> = new Map();
  private readonly restart = new IntervalManager();

  public constructor() {
    this.restart.start(() => {
      this.binders.entries().filter(([_, v]) => !v.isAlive).forEach(([k, v]) => {
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

  public dispatch(event: IndexedMessageContexts): void {
    this.binders.forEach((v) => {
      v.postMessage(event);
    });
  }

  public terminate(): void {
    this.restart.stop();
    this.binders.forEach((binder) => {
      binder.terminate();
    });
  }
}
