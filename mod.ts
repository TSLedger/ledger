import { merge } from './deps.ts';
import type { LedgerOptions } from './lib/interface/option.ts';
import { WorkerController } from './lib/worker-controller.ts';

/** Ledger */
export class Ledger {
  private options: LedgerOptions;
  private controller: WorkerController;
  private defaults: Partial<LedgerOptions> = {
    respawn: {
      limit: 30,
      ms: 1000,
    },
  };

  /**
   * Initialize Ledger.
   *
   * @param options The {@link LedgerOptions}.
   */
  public constructor(options: LedgerOptions, exceptions: (e: Error) => void) {
    // Ensure Defaults.
    this.options = merge(this.defaults, options) as LedgerOptions;

    // Initialize the Controller.
    this.controller = new WorkerController(this.options, exceptions);
  }

  /**
   * Async Blocking for Initialization.
   */
  public async available(): Promise<void> {
    const wait: Promise<void>[] = [];
    // this.controller.workers.forEach((v) => {
    //   // wait.push();
    // });
    await Promise.all(wait);
  }

  /**
   * Async Blocking for Shutdown.
   */
  public async shutdown(): Promise<void> {
    return await this.controller.shutdown();
  }
}
