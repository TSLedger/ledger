import { TransportWorkerController } from './worker-controller.ts';

Deno.test('worker-controller.ts worker.ts', async () => {
  const controller = new TransportWorkerController(new URL('..test/test-transport.ts', import.meta.url).toString(), {
    developerMode: true,
  });
  const timeout = setTimeout(() => {
    console.info(controller['heartbeat']);
    controller.shutdown();
    clearTimeout();
  }, 500);
  clearTimeout(timeout);
});
