<p align="center">
  <img style="border-radius=50%" height="150" src="./.github/asset/cover_base.png">
</p>

## What is Ledger?

> [!CAUTION]
> This Library is a Work in Progress and is NOT ready for production use. APIs are subject to change and breakage.

Welcome to Ledger, a batteries-included TypeScript-first Logging Framework on JSR. Compatible with Deno and Node.js. Themed to a Ledger of Records

Ledger provides the structure to create or utilize a binder to process loggable events. These transports can range from stdout, file-backed, or even pure HTTP Requests for any vendor. Anything that is possible with in TypeScript is possible to do in Ledger.

## What is a Binder?

A Ledger Binder (Handler) is simply a managed worker instance that receives a payload from the Ledger API. You can leverage an infinite amount of handlers all working side-by-side. You can utilize pre-built handlers or publish one you create.

We recommend publishing binders to JSR.

Features:

- Binders using a Worker reduces the burden of Event Loop and enables async functionality.
- Binders will automatically restore in the event of a critical failure.

## Getting Started

If you are ready to give Ledger a try, you can get started with a snippet such as the below:

```ts
import { Ledger } from 'jsr:@ledger/ledger';

// Initialize Ledger
const ledger = new Ledger({
  useAsyncDispatchQueue: true, //  or false for ImmediateDispatch mode.
})
// Register a Handler. You can chain these too!
ledger.register({
  definition: 'jsr:@ledger/console-handler@0.0.0', // Version is Important. Please verify the latest version. See: https://jsr.io/@ledger for official handlers.
});

// Await Ledger to be alive and functional.
await ledger.alive();

// ledger.trace, ledger.information, ledger.warning, ledger.severe
ledger.information('Hello, world');

// Eventually...
ledger.terminate();
```

## Additional Documentation

Please visit the JSR Symbol Documentation at [JSR Docs](https://jsr.io/@ledger/ledger/doc) or the [GitHub Wiki](https://github.com/TSLedger/ledger/wiki) for additional examples and handler documentation.

## Support

Please use GitHub [Issues](https://github.com/TSLedger/ledger/issues) or [Discussions](https://github.com/TSLedger/ledger/discussions).

## Acknowledgements

[pinojs/pino](https://github.com/pinojs/pino) - Foundational Model and Worker Concepts
