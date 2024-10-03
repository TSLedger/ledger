import { type Message, type Payload, PayloadCode } from './util/struct.ts';

self.onmessage = async (ctx: MessageEvent<Payload>) => {
  switch (ctx.data.code) {
    case PayloadCode.CONFIGURE: {
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
