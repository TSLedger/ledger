export enum PayloadCode {
  HEARTBEAT,
  HANDLE,
}

export interface Payload {
  code: PayloadCode
}

export interface Heartbeat extends Payload {
  heartbeat: string;
}
