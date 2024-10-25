import { Book } from '../lib/book.ts';
import type { WorkerMessageContext } from '../lib/interface/context.ts';

export class Bookable extends Book {
  protected override async receive(_context: WorkerMessageContext): Promise<void> {
    await console.info(_context);
  }
}
