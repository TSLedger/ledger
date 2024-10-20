import type { WorkerSetPackageContext } from '../interface/context/base.ts';

/** */
export class WrappedWorker {
  public uuid: string | null = null;
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
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.worker.postMessage(this.setPackageContext);
  }

  public exit(): void {
    this.shutdown = true;
    this.worker?.terminate();
    this.worker = null;
  }
}
