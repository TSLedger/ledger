// deno-lint-ignore-file no-external-import no-console
import { stripAnsiCode } from 'jsr:@std/internal/styles';
import { assertEquals } from 'jsr:@std/assert/equals';
import { TransportOp } from '../lib/interface/op.ts';

// Test State
const decoder = new TextDecoder();
let stdout = '';

// Test Transport Function
Deno.test('transport.ts', async (t) => {
  await t.step({
    name: 'create',
    fn: async () => {
      const proc = await new Deno.Command('deno', {
        args: ['run', '--allow-read', '--allow-net', './example/example-transport.ts'],
      });
      const output = await proc.output();
      stdout = stripAnsiCode(decoder.decode(output.stdout).trim());
    },
  });
  await t.step({
    name: 'validate output',
    fn: () => {
      assertEquals(stdout, `consume ${TransportOp.HANDLE} test message`);
    },
  });
});
