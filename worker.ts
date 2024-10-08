import { TransportOp } from './lib/interface/op.ts';
import type { TransportHandleMessage, TransportMessage, TransportSetPackageMessage } from './lib/interface/struct.ts';
import type { LedgerTransport } from './lib/transport.ts';
import { Queue } from './deps.ts';

class TransportWorker {
  public static setPackageMessage: TransportSetPackageMessage;
  public static transport: LedgerTransport | null = null;
  public static queue: Queue<TransportHandleMessage> = new Queue();

  public static setTransport(message: TransportSetPackageMessage, transport: LedgerTransport): void {
    this.setPackageMessage = message;
    this.transport = transport;
  }
}

self.setInterval(() => {
  if (TransportWorker.transport === null || TransportWorker.queue.isEmpty()) return;
  TransportWorker.transport.consume(TransportWorker.queue.dequeue()!).catch((e) => {
    self.postMessage({
      op: TransportOp.INTERNAL_ERROR,
      message: e.message,
      stack: e.stack,
      transportJsrPackage: TransportWorker.setPackageMessage.package,
    });
  });
}, 1);

self.addEventListener('message', async (event: MessageEvent<TransportMessage>) => {
  switch (event.data.op) {
    case TransportOp.HEARTBEAT: {
      self.postMessage({
        op: TransportOp.HEARTBEAT,
      });
      break;
    }
    case TransportOp.SET_PACKAGE: {
      const message = event.data as TransportSetPackageMessage;
      const { Transport } = await import(message.package) as { Transport: typeof LedgerTransport };
      TransportWorker.setTransport(message, new Transport(message.options));
      break;
    }
    case TransportOp.HANDLE: {
      const message = event.data as TransportHandleMessage;
      TransportWorker.queue.enqueue(message);
    }
  }
});
