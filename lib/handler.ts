import type { ExternalTransport } from './base/transport.external.ts';
import type { InternalTransport } from './base/transport.internal.ts';
import { type Configure, type Message, type Payload, PayloadCode } from './util/struct.ts';
import { TransportLoader } from './util/transport.ts';

const transports: (InternalTransport | ExternalTransport)[] = [];

self.onmessage = async (ctx: MessageEvent<Payload>) => {
  switch (ctx.data.code) {
    case PayloadCode.CONFIGURE: {
      const message: Configure = ctx.data as Configure;
      if (message.type === 'INTERNAL') {
        for (const transport of message.transports) {
          transports.push(await TransportLoader.getInternalTransporter(transport, {}));
        }
      } else if (message.type === 'EXTERNAL') {
        for (const transport of message.transports) {
          transports.push(await TransportLoader.getExternalTransporter(transport, {
            name: 
            package: transport,
          }));
        }
      }
      break;
    }
    case PayloadCode.MESSAGE: {
      // Parse and Acknowledge
      const message: Message = ctx.data as Message;

      // Handle
      // TODO: APPLY FORMATTING
      // TODO: SEND TO TRANSPORTS WITH CONFIGURED FORMATTING
      console.info('message', ctx.data);

      break;
    }
    case PayloadCode.HEARTBEAT: {
      const message: Payload = {
        code: PayloadCode.HEARTBEAT,
      };
      self.postMessage(message);
      break;
    }
  }
};

//   switch (ctx.data.code) {
//     case PayloadCode.HEARTBEAT: {
//       const message: Heartbeat = ctx.data as Heartbeat;
//       self.postMessage({
//         code: PayloadCode.HEARTBEAT,
//         heartbeat: message.heartbeat,
//       });
//       break;
//     }
//     case PayloadCode.ADD: {
//       const message: Message = ctx.data as Message;
//       self.postMessage({
//         code: PayloadCode.ACKNOWLEDGE,
//         uuid: message.uuid,
//       });
//       console.info('sendack', message.uuid);
//       break;
//     }
//   }
