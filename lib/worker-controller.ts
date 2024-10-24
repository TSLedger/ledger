import type { WorkerEvent } from './interface/context/base.ts';
import type { LedgerOptions } from './interface/option.ts';
import { WrappedWorker } from './util/wrapped_worker.ts';

/** WorkerController */
export class WorkerController {
  public workers = new Set<WrappedWorker>();

  /** */
  public constructor(options: LedgerOptions, exceptions: (e: Error) => void) {
    for (const opts of options.workers) {
      if (opts.mode === 'jsr.io' && !/^(?:jsr:)?@.*\/.*$/.test(opts.package)) {
        throw new Error(`Package '${opts.package}' is not valid for type 'jsr.io' formatting.`);
      }
      this.workers.add(
        new WrappedWorker(opts, exceptions),
      );
    }
    for (const worker of this.workers) {
      worker.update();
    }
  }

  /** */
  public record(event: WorkerEvent): void {
    for (const worker of this.workers) {
      worker.get().postMessage(event);
    }
  }

  /** */
  public shutdown(): void {
    for (const worker of this.workers) {
      worker.exit();
    }
  }
}
