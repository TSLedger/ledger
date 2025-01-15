<p align="center">
  <img style="border-radius=50%" height="150" src="./.github/asset/cover_base.png">
</p>

## What is Ledger?

> [!CAUTION]
> This Library is a Work in Progress and is NOT ready for production use. APIs are subject to change and breakage.

Welcome to Ledger, a batteries-included TypeScript-first Logging Framework on JSR. Compatible with Deno and Node.js. Themed to a Ledger of Records

Ledger provides the structure to create or utilize a binder to process loggable events. These transports can range from stdout, file-backed, or even pure HTTP Requests for any vendor. Anything that is possible with in TypeScript is possible to do in Ledger.

## What is a Binder?

A Ledger Binder (Transport) is simply a managed worker instance that receives a payload from the Ledger API. You can leverage an infinite amount of transports all working side-by-side. You can utilize pre-built transports or publish one you create.

Binders must be published to JSR.

Features:
- Binders using a Worker reduces the burden of Event Loop and enables async function.
- Binders will automatically restore in the event of a critical failure.

## Getting Started

If you are ready to give Ledger a try, you can get started with a snippet such as the below:

```ts
import { Ledger } from 'jsr:@ledger/ledger';
import { delay } from 'jsr:@std/async@1.0.6/delay';

const ledger = new Ledger() // Create Ledger.
  .addTransportWorker('jsr:@ledger/console-transport', {}); // Adds the default Console Transport.
await ledger.await(); // Waits for startup. This is optional.s

// All Level Types.
ledger.trace('Hello World', { test: 123 });
ledger.info('Hello World', { test: 123 });
ledger.warn('Hello World', { test: 123 });
ledger.severe('Hello World', { test: 123 });

await delay(1000); // Optional - Applied for Tests. Ledger has a slight delay in logging.
ledger.shutdown(); // Required for process to exit. This shuts down the workers and auto recover process.
```

## Additional Documentation

Please visit the JSR Symbol Documentation at [JSR Docs](https://jsr.io/@ledger/ledger/doc) or the [GitHub Wiki](https://github.com/TSLedger/ledger/wiki) for additional examples and transport documentation.

## Support

Please use GitHub [Issues](https://github.com/TSLedger/ledger/issues) or [Discussions](https://github.com/TSLedger/ledger/discussions).

## Acknowledgements

[pinojs/pino](https://github.com/pinojs/pino) - Foundational Model and Worker Concepts
