import { Ledger } from './mod.ts';

const ledger = new Ledger({
  workers: [{
    mode: 'jsr.io',
    opts: {},
    package: '@ledger/console-transport',
  }],
}, (_) => {
  console.error('ex1', _);
});

setTimeout(async () => {
  console.info('shutdown');
  await ledger.shutdown();
}, 5000);
