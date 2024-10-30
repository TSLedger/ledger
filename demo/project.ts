import {Ledger} from '../mod.ts';

const ledger = new Ledger({
  pages: [
    {
      package: new URL('./consolePage.ts', import.meta.url),
    },
  ],
});

await ledger.writable();
