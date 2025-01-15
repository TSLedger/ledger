import type { MessageContext } from '../export.ts';

export interface BinderOption {
  jsr: `jsr:@${string}/${string}`;
}

export interface WorkerHandler {
  receive: ({ context }: MessageContext) => Promise<void>;
}
