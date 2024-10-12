// deno-lint-ignore-file no-external-import no-console

import { stripAnsiCode } from 'jsr:@std/internal/styles';
import { assertEquals } from 'jsr:@std/assert/equals';

// Test State
const decoder = new TextDecoder();
let stdout = '';
let stderr = '';

// Test Production
Deno.test('mod.ts production', async (t) => {
  await t.step({
    name: 'create',
    fn: async () => {
      const proc = await new Deno.Command('deno', {
        args: ['run', '--allow-read', '--allow-net', './example/example-ledger.ts'],
      });
      const output = await proc.output();
      stdout = stripAnsiCode(decoder.decode(output.stdout).trim());
      stderr = stripAnsiCode(decoder.decode(output.stderr).trim());
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

// Test Example Transport
