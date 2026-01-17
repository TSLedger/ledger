// deno-lint-ignore no-external-import
import { assertEquals, assertGreaterOrEqual, assertStringIncludes } from 'jsr:@std/assert@1.0.16';

let spCode: number;
let spStdout: string;
let spStderr: string;

Deno.test('Ledger - Mock Handler Runtime Report', async (kit) => {
  await kit.step('Dispatch Process', async () => {
    const command = new Deno.Command(Deno.execPath(), {
      args: ['run', '--allow-all', './test/mock-runtime.ts'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const decoder = new TextDecoder();
    const { code, stdout, stderr } = await command.output();
    spCode = code;
    spStdout = decoder.decode(stdout);
    spStderr = decoder.decode(stderr);
  });
  await kit.step('Verify Process Output Expectations', () => {
    assertEquals(spCode, 0);
    assertGreaterOrEqual(spStdout.length, 0);
    assertGreaterOrEqual(spStderr.length, 0);
  });
  await kit.step('Verify Process (stdout) Content', () => {
    // Base
    assertStringIncludes(spStdout, 'Test IPC Service');
    assertStringIncludes(spStdout, 'Validating API');
    // Properties
    assertStringIncludes(spStdout, 'test-info');
    assertStringIncludes(spStdout, 'some test');
    assertStringIncludes(spStdout, 'Test Error');
    assertStringIncludes(spStdout, 'array');
    assertStringIncludes(spStdout, 'set');
    assertStringIncludes(spStdout, 'map');
    assertStringIncludes(spStdout, 'k1');
    assertStringIncludes(spStdout, 'v1');
    assertStringIncludes(spStdout, 'k2');
    assertStringIncludes(spStdout, 'v2');
    assertStringIncludes(spStdout, 'nested');
    assertStringIncludes(spStdout, '2025-01-01');
  });
  await kit.step('Verify Process (stderr) Content', () => {
    // Base
    assertStringIncludes(spStderr, 'Test IPC Service');
    assertStringIncludes(spStderr, 'Validating API');
    // Properties
    assertStringIncludes(spStderr, 'test-error');
    assertStringIncludes(spStderr, 'some test');
    assertStringIncludes(spStderr, 'Test Error');
    assertStringIncludes(spStderr, 'array');
    assertStringIncludes(spStderr, 'set');
    assertStringIncludes(spStderr, 'map');
    assertStringIncludes(spStderr, 'k1');
    assertStringIncludes(spStderr, 'v1');
    assertStringIncludes(spStderr, 'k2');
    assertStringIncludes(spStderr, 'v2');
    assertStringIncludes(spStderr, 'nested');
    assertStringIncludes(spStderr, '2025-01-01');
  });
});
