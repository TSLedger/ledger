import { interval, Queue } from './deps.ts';

const queue = new Queue<number>();

async function it1(): Promise<void> {
    for await (const check of interval(() => {}, 5)) {
        console.info('it1');
    }
}

async function it2(): Promise<void> {
    for await (const check of interval(() => {}, 0)) {
        console.info('it2');
    }
}

it1();
it2();
