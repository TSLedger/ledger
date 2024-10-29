import { Page } from '../lib/page.ts';
import type { PageMessageContext } from '../lib/interface/context.ts';

export class ConsolePage extends Page {
  public constructor() {
    super();
  }

  protected override async receive(_context: PageMessageContext): Promise<void> {
    await console.info(_context);
  }
}

new ConsolePage();
