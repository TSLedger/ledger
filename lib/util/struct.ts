import type { Level } from './level.ts';
import type { TransportsType } from './transport.ts';

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

export type Configure = ConfigureInternal | ConfigureExternal;

interface ConfigureInternal extends Payload {
  type: 'INTERNAL';
  transports: TransportsType[];
}

interface ConfigureExternal extends Payload {
  type: 'EXTERNAL'
  transports: string[]
}

export interface Message extends Payload {
  uuid: string;
  date: Date;
  level: Level;
  message: unknown[];
}
