import type { Binder } from './lib/binder.ts';
import type { BinderOption } from './lib/struct/interface/options.ts';

// Original: Pen

export class Ledger {
  private readonly binders: Map<string, Binder> = new Map();
  private readonly state: AbortController = new AbortController();

  public async register(options: BinderOption): Promise<Ledger> {
    return this;
  }
}
