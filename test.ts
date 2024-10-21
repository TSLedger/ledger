import { interval } from './deps.ts';

let hb = false;

function heartbeat(): void {
  hb = true;
}

function got_heartbeat(): void {
  if (!hb) return;
  console.info('got heartbeat');
  hb = false;
}

async function off_tick(): Promise<void> {
  for await (const response of interval(heartbeat, 5, {})) {
  }
}

async function sec_tick(): Promise<void> {
  for await (const response of interval(got_heartbeat, 100, {})) {
  }
}

off_tick();
sec_tick();
