import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// S006 regression: Vercel compiles each API file to .js separately and does not bundle.
// '.ts' import specifiers left in that output crash the function at load time
// (FUNCTION_INVOCATION_FAILED on the deployed S005 build). This mirrors that per-file emit.
const root = resolve(import.meta.dirname, '..');
const { config } = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile);
const { options } = ts.convertCompilerOptionsFromJson(config.compilerOptions, root);
const specifiers = (source) => [...source.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g)].map((m) => m[1]);

function emitFunctionGraph(outDir) {
  const pending = [join(root, 'api', 'decision.ts')], seen = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const spec of specifiers(source)) pending.push(resolve(dirname(file), spec));
    const { outputText } = ts.transpileModule(source, { fileName: file, compilerOptions: { ...options, noEmit: false } });
    const target = join(outDir, relative(root, file)).replace(/\.ts$/, '.js');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, outputText);
  }
  writeFileSync(join(outDir, 'package.json'), JSON.stringify({ type: 'module' }));
  return [...seen];
}

test('per-file compiled API function has only .js relative imports and loads', async () => {
  const outDir = mkdtempSync(join(tmpdir(), 'etta-fn-'));
  try {
    const files = emitFunctionGraph(outDir);
    assert.ok(files.length >= 5, 'function graph includes server and shared protocol modules');
    for (const file of files) {
      const emitted = readFileSync(join(outDir, relative(root, file)).replace(/\.ts$/, '.js'), 'utf8');
      for (const spec of specifiers(emitted)) assert.match(spec, /\.js$/, `${relative(root, file)} imports ${spec}`);
    }
    const handler = (await import(pathToFileURL(join(outDir, 'api', 'decision.js')).href)).default;
    const response = await handler.fetch(new Request('https://etta.test/api/decision'));
    assert.equal(response.status, 200);
    assert.ok(['DISABLED', 'READY'].includes((await response.json()).status));
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
