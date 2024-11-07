<p align="center">
  <img style="border-radius=50%" height="150" src="./.github/asset/cover_base.png">
</p>

## What is Ledger?

> [!CAUTION]
> This is a Work in Progress. APIs are subject to change and breakage.

Welcome to Ledger, a batteries-included TypeScript-first Logging Framework on JSR. Compatible with Deno and Node.js.

Ledger provides the fundamentals to create or utilize transports to process loggable events. These transports can range
from Console, File [Rotation], Sentry, or even pure HTTP Requests. Anything that is possible with in TypeScript is
possible in Ledger as you control what you do with the event.

## What is a Transport?

A Ledger Transport is simply a managed worker instance that receives a payload from Ledger. You can have an infinite
number of transports all working side-by-side. You can use existing transports from JSR or even create your own!

Transports, generally, must be published to JSR. You can use the developerMode option to bypass this.

- [TODO] Transports can filter the Level of events received,
- Transports self-recover in the event of an error. The worker will continually respawn and catch all internal errors,

## Getting Started

If you are ready to give Ledger a try, you can get started with a snippet such as the below:

```ts
import {Ledger} from 'jsr:@ledger/ledger';
import {delay} from 'jsr:@std/async@1.0.6/delay';

const ledger = new Ledger() // Create Ledger.
  .addTransportWorker('jsr:@ledger/console-transport', {}); // Adds the default Console Transport.
await ledger.await(); // Waits for startup. This is optional.

// All Level Types.
ledger.trace('Hello World', {test: 123});
ledger.info('Hello World', {test: 123});
ledger.warn('Hello World', {test: 123});
ledger.severe('Hello World', {test: 123});

await delay(1000); // Optional - Applied for Tests. Ledger has a slight delay in logging.
ledger.shutdown(); // Required for process to exit. This shuts down the workers and auto recover process.
```

## Additional Documentation

Please visit the JSR Symbol Documentation at [JSR Docs](https://jsr.io/@ledger/ledger/doc) or
the [GitHub Wiki](https://github.com/TSLedger/ledger/wiki) for additional examples and transport documentation.

## Support

Please use GitHub [Issues](https://github.com/TSLedger/ledger/issues)
or [Discussions](https://github.com/TSLedger/ledger/discussions).

## Acknowledgements

[pinojs/pino](https://github.com/pinojs/pino) - Foundational Model and Worker Concepts
