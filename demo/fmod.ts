import { Ledger } from '../mod.ts';

const ledger = new Ledger({
  page: [
    {
      package: new URL('./console.ts', import.meta.url),
      options: {
        struct: true,
      },
    },
  ],
});

setInterval(() => {
  ledger.trace('test trace');
}, 200);
