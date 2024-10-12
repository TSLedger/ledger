import { Ledger } from '../../mod.ts';
import { delay } from '../../deps.ts';

const ledger = new Ledger()
  .addTransportWorker('jsr:@ledger/console-transport', {});
await ledger.await();

ledger.trace('Hello World', { test: 123 });
ledger.info('Hello World', { test: 123 });
ledger.warn('Hello World', { test: 123 });
ledger.severe('Hello World', { test: 123 });

await delay(1000); // Optional - Applied for Tests.
ledger.shutdown();
