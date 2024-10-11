import { delay } from './deps.ts';
import { Ledger } from './mod.ts';

// deno-lint-ignore no-external-import
import { assertEquals } from 'jsr:@std/assert/equals';

Deno.test({
  name: 'mod.ts production',
  fn: async () => {
    const ledger = new Ledger()
      .addTransportWorker('jsr:@ledger/console-transport', {
        developerMode: true,
      });
    await ledger.await();
    ledger['transports'].forEach((v) => {
      assertEquals(v['ini'], true);
    });
    ledger.shutdown();

    await delay(1000);
  },
});

Deno.test({
  name: 'mod.ts developerMode',
  fn: async () => {
    const ledger = new Ledger()
      .addTransportWorker(new URL('./test/test-transport.ts', import.meta.url).toString(), {
        developerMode: true,
      });
    await ledger.await();
    ledger['transports'].forEach((v) => {
      assertEquals(v['ini'], true);
    });
    ledger.shutdown();

    await delay(1000);
  },
});
