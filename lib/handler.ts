import { Heartbeat, type Payload, PayloadCode } from './util/payload.ts';

self.onmessage = async (ctx: MessageEvent<Payload>) => {
  switch (ctx.data.code) {
    case PayloadCode.HEARTBEAT: {
      const message: Heartbeat = ctx.data as Heartbeat;
      self.postMessage({
        code: PayloadCode.HEARTBEAT,
        heartbeat: message.heartbeat,
      });
      break;
    }
  }
};
