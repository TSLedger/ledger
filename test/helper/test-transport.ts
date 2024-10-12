import { Level } from '../../lib/interface/level.ts';
import { TransportOp } from '../../lib/interface/op.ts';
import { Transport } from './transport.ts';

const transport = new Transport({});
await transport.consume({
  op: TransportOp.HANDLE,
  level: Level.TRACE,
  date: new Date(),
  message: 'test message',
  args: [],
});
