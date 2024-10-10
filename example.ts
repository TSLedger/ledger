import { Ledger } from './mod.ts';

const ledger = new Ledger()
  .addTransportWorker('jsr:@ledger/console-transport', {});

setInterval(() => {
  ledger.info('test test 123');
}, 1000);
