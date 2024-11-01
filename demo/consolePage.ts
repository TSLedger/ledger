import {Page} from '../lib/page.ts';
import type {PageMessageContext} from '../lib/interface/context.ts';

export class ConsolePage extends Page {
  public constructor() {
    super();
    console.info('Console Page _ini')
  }

  protected override async receive(ctx: PageMessageContext): Promise<void> {
    await console.info(ctx.context.message);
  }
}

new ConsolePage();
