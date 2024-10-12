// deno-lint-ignore-file no-external-import no-console

import { stripAnsiCode } from 'jsr:@std/internal/styles';
import { assertEquals } from 'jsr:@std/assert/equals';

// Test State
const decoder = new TextDecoder();
let stdout = '';

// Test Production
Deno.test('mod.ts production', async (t) => {
  await t.step({
    name: 'create',
    fn: async () => {
      const proc = await new Deno.Command('deno', {
        args: ['run', '--allow-read', '--allow-net', './test/helper/test-ledger.ts'],
      });
      const output = await proc.output();
      stdout = stripAnsiCode(decoder.decode(output.stdout).trim());
    },
  });
  await t.step({
    name: 'validate output',
    fn: () => {
      assertEquals(/\[.*\] TRACE: Hello World \[{ test: 123 }\]/.test(stdout), true);
      assertEquals(/\[.*\] INFO: Hello World \[{ test: 123 }\]/.test(stdout), true);
      assertEquals(/\[.*\] WARN: Hello World \[{ test: 123 }\]/.test(stdout), true);
      assertEquals(/\[.*\] SEVERE: Hello World \[{ test: 123 }\]/.test(stdout), true);
    },
  });
});
