import { Ledger } from './mod.ts';

const ledger = new Ledger({
  workers: [{
    mode: 'jsr.io',
    opts: {},
    package: 'jsr:@ledger/console-transport',
  }],
}, (_) => {
  console.error('ex1', _);
});
await ledger.available();
console.info('avail');

setTimeout(async () => {
  console.info('shutdown');
  await ledger.shutdown();
}, 5000);
