
import {Pen} from "./lib/pen.ts";
import type {PageOptions} from "./lib/interface/page.if.ts";
import type { PageMessageContext } from './lib/interface/context.if.ts';
import { Op } from './lib/interface/operation.if.ts';
import { Level } from './lib/interface/level.if.ts';

// noinspection JSUnusedGlobalSymbols
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
      op: Op.MESSAGE,
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


