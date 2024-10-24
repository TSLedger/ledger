import { interval } from '../../deps.ts';
import { type JoinedWorkerContexts, Operation } from '../interface/context/base.ts';
import type { WorkerOptions } from '../interface/option.ts';

/** */
export class WrappedWorker {
  private options: WorkerOptions;
  private uuid: string | null = null;
  private worker: Worker | null = null;

  private initialize: boolean = false;
  private heartbeat: boolean = false;
  private shutdown: boolean = false;
  private exceptions: (e: Error) => void = () => {};

  public constructor(options: WorkerOptions, exceptions: (e: Error) => void) {
    this.options = options;
    this.exceptions = exceptions;
  }

  public get(): Worker {
    if (this.worker === null && !this.shutdown) {
      this.update();
    }
    return this.worker!;
  }

  public update(): void {
    if (this.shutdown) return;

    // Reset WOrker
    this.worker = null;
    this.uuid = crypto.randomUUID();
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

    // Setup Heartbeat
    this.send().catch(() => {});
    this.check().catch(() => {});
    this.worker.addEventListener('message', (event: MessageEvent<JoinedWorkerContexts>) => {
      const evt = event.data;
      switch (evt.op) {
        case Operation.HEARTBEAT: {
          this.heartbeat = true;
          break;
        }
        case Operation.INITIALIZED: {
          this.initialize = true;
          break;
        }
        case Operation.ERROR: {
          this.exceptions(evt.context.e);
        }
      }
    });
    this.worker.postMessage({
      op: Operation.SET_PACKAGE,
      context: {
        options: this.options,
      },
    });
  }

  public async waitForReadyEvent(): Promise<void> {
    for await (
      const _ of interval(() => {
        if (!this.heartbeat || !this.initialize) return false;
        return true;
      }, 500)
    ) {
      if (_ === false) continue;
      break;
    }
  }

  public exit(): void {
    this.shutdown = true;
    this.worker?.terminate();
    this.worker = null;
  }

  private async send(): Promise<void> {
    const uuid = `${this.uuid}`;
    for await (
      const _ of interval(() => {
        if (uuid !== this.uuid || this.shutdown) return false;
        if (this.heartbeat) return true;
        this.worker?.postMessage({
          op: Operation.HEARTBEAT,
        });
        return true;
      }, 25)
    ) if (_ === false) break;
  }

  private async check(): Promise<void> {
    const uuid = `${this.uuid}`;
    for await (
      const _ of interval(() => {
        if (uuid !== this.uuid || this.shutdown) return false;
        if (!this.heartbeat) {
          this.update();
        }
        this.heartbeat = false;
        return true;
      }, 100)
    ) if (_ === false) break;
  }
}
