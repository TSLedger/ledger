import { Ledger } from 'jsr:@ledger/ledger';

const ledger = new Ledger()
  .addTransportWorker('jsr:@ledger/console-transport', {});

ledger.info('test');
