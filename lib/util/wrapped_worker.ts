/** */
export class InternalWorker {
  public uuid: string | null = null;
  private worker: Worker | null = null;

  public get(): Worker {
    if (this.worker === null) {
      this.create();
    }
    return this.worker!;
  }

  public create(): void {
    this.uuid = crypto.randomUUID();
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  }
}
