import { delay } from './deps.ts';
import { Level } from './lib/interface/level.ts';
import { TransportOp } from './lib/interface/op.ts';
import { TransportWorkerController } from './worker-controller.ts';

// deno-lint-ignore no-external-import
import { assertEquals } from 'jsr:@std/assert';

Deno.test({
  name: 'worker-controller.ts',
  fn: async () => {
    const controller = new TransportWorkerController(new URL('./test/test-transport.ts', import.meta.url).toString(), {
      developerMode: true,
    });
    await controller.awaitReady(1000);

    assertEquals(controller['heartbeat'], true);
    assertEquals(controller['ini'], true);

    controller.emit({
      op: TransportOp.HANDLE,
      level: Level.TRACE,
      date: new Date(),
      message: 'test message',
      args: ['test', 'test'],
    });
    controller.shutdown();

    assertEquals(controller['heartbeat'], false);
    assertEquals(controller['ini'], false);

    await delay(1000);
  },
});
