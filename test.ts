import { newQueue } from 'jsr:@henrygd/queue';

const queue = newQueue(5);

console.info('queue ready');
queue.add(async () => {
  console.info('async 1');
});
