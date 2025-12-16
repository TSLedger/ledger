import { Ledger } from '@ledger/ledger';
import { Level } from './lib/struct/interface/level.ts';

let ledger: Ledger;

Deno.test('Runtime Definition Test', async (kit) => {
  await kit.step('setup', async () => {
    ledger = new Ledger({
      service: 'Test IPC Service',
      troubleshooting: true,
      troubleshootingIPC: false,
      useAsyncDispatchQueue: true,
    });
    ledger.register({
      definition: new URL('./lib/internal/mock.handler.ts', import.meta.url).href,
      level: Level.INFORMATION,
    });
    await ledger.alive();
  });
  await kit.step('poll alive', async () => {
    await ledger.alive();
  });
  await kit.step('validate api', async () => {
    const object = {
      name: 'some test',
      value: 42,
      error: new Error('Test Error'),
      array: [1, 2, 3],
      set: new Set([1, 2, 3]),
      map: new Map([['key1', 'value1'], ['key2', 'value2']]),
      nested: {
        a: 1,
        b: [true, false, null],
        c: { d: 'deep' },
      },
    };

    ledger.trace('Validating API... (Trace)', object);
    ledger.information('Validating API... (Information)', object);
    ledger.warning('Validating API... (Warning)', object);
    ledger.severe('Validating API... (Severe)', object);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    ledger.terminate();
  });
});
