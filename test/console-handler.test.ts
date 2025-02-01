import { Ledger } from '../mod.ts';

const ledger = new Ledger({
  useAsyncDispatchQueue: false,
})
  .register({
    definition: 'jsr:@ledger/console-handler',
  });
await ledger.alive();

ledger.information('Hello, world.');

setTimeout(() => {
  ledger.terminate();
}, 500);
