import type { Level } from './level.ts';

/**
 * Payload OP Codes for Worker.
 */
export enum PayloadCode {
  CONFIGURE,
  MESSAGE,
  HEARTBEAT,
}

/**
 * Base Payload to Facilitate OP Code.
 */
export interface Payload {
  code: PayloadCode;
}

export interface Message extends Payload {
  uuid: string;
  date: Date;
  level: Level;
  message: unknown[];
}
