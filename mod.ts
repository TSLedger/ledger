import { Queue } from '@cm-iv/queue';
import type { Message, Payload } from './lib/util/struct.ts';
import { PayloadCode } from './lib/util/struct.ts';
import { Level } from './lib/util/level.ts';

export class Ledger {
  private worker: Worker | null = null;
  private queue = new Queue<Message>();

  private accepting = false;
  private handleQueueInterval: number = -1;
  private heartbeatQueueInverval: number = -1;

  public constructor() {
    // Create Worker
    this.createWorker();
  }

  private createWorker(): void {
    this.shutdown();
    this.worker = new Worker(new URL('./lib/handler.ts', import.meta.url).href, { type: 'module' });
    this.addEventListener();
    this.addIntervalSchedule();
  }

  private addEventListener(): void {
    this.worker!.addEventListener('message', (message: MessageEvent<Payload>) => {
      switch (message.data.code) {
        case PayloadCode.HEARTBEAT: {
          this.accepting = true;
          break;
        }
      }
    });
  }

  private addIntervalSchedule(): void {
    clearInterval(this.handleQueueInterval);
    clearInterval(this.heartbeatQueueInverval);

    // Add Schedule
    this.handleQueueInterval = setInterval(() => {
      try {
        if (!this.accepting || this.worker === null || this.queue.isEmpty()) return;
        const message = this.queue.dequeue();
        if (message !== undefined) {
          this.worker.postMessage(message);
        }
      } catch (e: unknown) {
        this.send({
          code: PayloadCode.MESSAGE,
          uuid: crypto.randomUUID(),
          date: new Date(),
          level: Level.CRITICAL,
          message: ['Failed to Process Ledger Queue', e],
        });
      }
    }, 1);

    this.heartbeatQueueInverval = setInterval(() => {
      if (this.accepting === false) {
        this.createWorker();
      }
      this.accepting = false;
      this.worker?.postMessage({
        code: PayloadCode.HEARTBEAT,
      });
    }, 500);
  }

  public send(message: Message): void {
    this.queue.enqueue(message);
  }

  public shutdown(): void {
    this.accepting = false;
    clearInterval(this.heartbeatQueueInverval);
    clearInterval(this.handleQueueInterval);
    this.worker?.terminate();
  }
}

const ledger = new Ledger();
ledger.send({
  code: PayloadCode.MESSAGE,
  uuid: crypto.randomUUID(),
  date: new Date(),
  level: 'silly-severe',
});

// import { type Acknowledge, type Heartbeat, type Message, type Payload, PayloadCode } from './lib/util/struct.ts';
// import { newQueue } from '@henrygd/queue';

// /**
//  * The Ledger Builder Class.
//  */
// export class Ledger {
//   private options: LedgerOptions;
//   private worker: Worker | null = null;

//   // Message Queue
//   private queue = newQueue(5);
//   private acknowledge = new Set<string>();

//   // Heartbeat Queue
//   private heartbeatInterval: number;
//   private heartbeat = '';

//   public constructor(options: LedgerOptions) {
//     this.options = options;
//     this.createWorker();
//   }

//   private createWorker(): void {
//     this.worker =

//     this.heartbeatInterval = setInterval(async () => {
//       if (!(await this.waitForHeartbeat())) {
//         this.worker.terminate();
//         this.worker = new Worker(new URL('./lib/handler.ts', import.meta.url).href, { type: 'module' });
//         this.addListener();
//         console.info('TODO: ADD NOTICE TO HEARTBEAT (LEDGER) INTERNAL FAILURE');
//       }
//     }, 250);
//     // Heartbeat Handler
//     this.worker!.addEventListener('message', (ctx: MessageEvent<Payload>) => {
//       switch (ctx.data.code) {
//         case PayloadCode.HEARTBEAT: {
//           const message: Heartbeat = ctx.data as Heartbeat;
//           this.heartbeat = message.heartbeat;
//           break;
//         }
//         case PayloadCode.ACKNOWLEDGE: {
//           const message: Acknowledge = ctx.data as Acknowledge;
//           this.acknowledge.add(message.uuid);
//           break;
//         }
//       }
//     });
//   }

//   private async waitForHeartbeat(): Promise<boolean> {
//     const heartbeat = crypto.randomUUID();
//     this.worker.postMessage({
//       code: PayloadCode.HEARTBEAT,
//       heartbeat,
//     });
//     return await new Promise((resolve) => {
//       setTimeout(() => {
//         if (this.heartbeat === heartbeat) {
//           return resolve(true);
//         } else {
//           return resolve(false);
//         }
//       }, 100);
//     });
//   }

//   private async waitForAcknowledgement(uuid: string): Promise<boolean> {
//     return await new Promise((resolve) => {
//       setTimeout(() => {
//         if (this.acknowledge.has(uuid)) {
//           this.acknowledge.delete(uuid);
//           return resolve(true);
//         } else {
//           return resolve(false);
//         }
//       }, 500);
//     });
//   }

//   /**
//    * Shutdown Ledger and the Worker Thread.
//    */
//   public shutdown(): void {
//     clearInterval(this.heartbeatInterval);
//     this.worker.terminate();
//   }

//   /**
//    * Terminate and Restart the Worker Thread.
//    */
//   public restart(): void {
//     this.worker.terminate();
//   }

//   public async mockSendMessage(): Promise<void> {
//     const message: Message = {
//       code: PayloadCode.ADD,
//       uuid: crypto.randomUUID(),
//     };
//     this.worker.postMessage(message);
//     while (!(await this.waitForAcknowledgement(message.uuid))) {
//       this.worker.postMessage(message);
//     }
//     console.info('acktrue');
//   }
// }

// export interface LedgerOptions {
//   name: string;
// }

// const r = new Ledger({
//   name: 'test',
// });
// await r.mockSendMessage();
