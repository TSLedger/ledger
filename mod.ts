import {Level, Operation, PageMessageContext} from "./lib/interface/context.ts";
import {Pen} from "./lib/pen.ts";

export class Ledger {
  private readonly options: LedgerOptions;
  private readonly pens: Set<Pen> = new Set();

  public constructor(options: LedgerOptions) {
    this.options = options;
    for (const page of this.options.pages) {
      this.pens.add(new Pen(page));
    }
  }

  public async writable(): Promise<void> {
    await Promise.all(this.pens.values().map((v) => v.writeable()));
  }

  private write(message: string, args: unknown[], level: Level): void {
    const ctx: PageMessageContext = {
      op: Operation.MESSAGE,
      context: {
        message,
        args,
        level,
        date: new Date(),
      }
    }

    this.pens.forEach((p) => {
      p.post(ctx);
    });
  }

  public trace(message: string, ...args: unknown[]): void {
    this.write(message, args, Level.TRACE);
  }

  public info(message: string, ...args: unknown[]): void {
    this.write(message, args, Level.INFO);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.write(message, args, Level.WARN);
  }

  public severe(message: string, ...args: unknown[]): void {
    this.write(message, args, Level.SEVERE);
  }

  public terminate(): void {
    this.pens.forEach((p) => p.terminate());
  }
}

export interface LedgerOptions {
  pages: PageOptions[];
}

export interface PageOptions {
  package: `@${string}/${string}` | URL;
}
