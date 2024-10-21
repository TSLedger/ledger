import { interval } from '../../deps.ts';
import { type JoinedWorkerContexts, Operation, type WorkerSetPackageContext } from '../interface/context/base.ts';

/** */
export class WrappedWorker {
  public uuid: string | null = null;
  private heartbeat: boolean = false;
  private shutdown: boolean = false;
  private worker: Worker | null = null;
  private setPackageContext: WorkerSetPackageContext;

  public constructor(setPackageContext: WorkerSetPackageContext) {
    this.setPackageContext = setPackageContext;
  }

  public get(): Worker {
    if (this.worker === null && !this.shutdown) {
      this.create();
    }
    return this.worker!;
  }

  public create(): void {
    this.worker = null;
    this.uuid = crypto.randomUUID();
    this.heartbeat = true;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.send().catch(() => {});
    this.check().catch(() => {});
    this.worker.addEventListener('message', (event: MessageEvent<JoinedWorkerContexts>) => {
      const evt = event.data;
      switch (evt.op) {
        case Operation.HEARTBEAT: {
          this.heartbeat = true;
          break;
        }
      }
    });
    // this.worker.postMessage(this.setPackageContext);
  }

  public async exit(): Promise<void> {
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
          this.create();
        }
        this.heartbeat = false;
        return true;
      }, 100)
    ) if (_ === false) break;
  }
}
