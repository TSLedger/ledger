import {Ledger} from '../mod.ts';

const ledger = new Ledger({
  pages: [
    {
      package: new URL('./consolePage.ts', import.meta.url),
    },
  ],
});

await ledger.writable();

ledger.trace('test trace');
ledger.info('test message');
ledger.warn('test warning');
ledger.severe('test severe');

setTimeout(() => {
  ledger.terminate();
}, 500)
