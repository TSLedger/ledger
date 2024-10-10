import { delay } from './deps.ts';
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

    controller.shutdown();
    await delay(1000);
  },
});
